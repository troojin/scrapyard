'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createProjectRecord } from '@/lib/projectsApi';
import { inspectZipArchive, formatBytes } from '@/lib/archiveValidator';
import { MAX_PROJECT_IMAGES, MAX_IMAGE_BYTES } from '@/lib/projectImages';
import { AuthModal } from '@/components/AuthModal';
import { ProjectPreview } from '@/components/ProjectPreview';
import { FileTreePreview } from '@/components/FileTreePreview';
import { getAvatarUrl } from '@/lib/pocketbase';
import type { FileTreeItem } from '@/types';
import { Inter } from 'next/font/google';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  FolderArchive,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

const fieldCls = `w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`;
const primaryBtn = `w-full py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100 ${focusRing}`;
const dropCls = `w-full border border-dashed border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#141414] rounded-lg p-6 text-center transition-colors ${focusRing}`;
const backLinkCls =
  'group inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors';

function BackLink() {
  return (
    <Link href="/" className={backLinkCls}>
      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>Back to catalog</span>
    </Link>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-medium text-[#fafafa]">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-[#5c5c5c]">Optional</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#737373] leading-relaxed">{hint}</p>}
    </div>
  );
}

function Banner({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const isError = tone === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      className={`mb-6 p-3 rounded-lg text-xs flex items-start gap-2 ${
        isError
          ? 'bg-[#ef4444]/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.35)] text-[#fca5a5]'
          : 'bg-[#22c55e]/10 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.35)] text-[#86efac]'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-px ${isError ? 'text-[#ef4444]' : 'text-[#22c55e]'}`} />
      <span>{children}</span>
    </div>
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [listingType, setListingType] = useState<'free' | 'sale'>('free');
  const [price, setPrice] = useState('20');
  const [title, setTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [reasonAbandoned, setReasonAbandoned] = useState('');
  const [salvageableCode, setSalvageableCode] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [isValidatingZip, setIsValidatingZip] = useState(false);
  const [zipValidationSuccess, setZipValidationSuccess] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const parsedTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (picked.length === 0) return;

    setError(null);

    const room = MAX_PROJECT_IMAGES - images.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_PROJECT_IMAGES} images`);
      return;
    }

    const tooBig = picked.filter((f) => f.size > MAX_IMAGE_BYTES);
    const valid = picked.filter((f) => f.size <= MAX_IMAGE_BYTES).slice(0, room);

    if (tooBig.length > 0) {
      setError('Each image must be under 5MB');
    } else if (picked.length > room) {
      setError(`Only ${MAX_PROJECT_IMAGES} images are allowed, so some were skipped`);
    }

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) =>
          prev.length >= MAX_PROJECT_IMAGES
            ? prev
            : [
                ...prev,
                {
                  id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
                  file,
                  preview: ev.target?.result as string,
                },
              ]
        );
      };
      reader.readAsDataURL(file);
    });
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (zipInputRef.current) zipInputRef.current.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Source code archive must be a .zip file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Source code archive must be under 100MB.');
      return;
    }

    setError(null);
    setIsValidatingZip(true);
    setZipValidationSuccess(null);

    try {
      const inspection = await inspectZipArchive(file);
      setArchiveFile(file);
      setFileTree(inspection.files);
      setZipValidationSuccess(
        `Archive verified: ${inspection.fileCount} source files (${formatBytes(inspection.totalSize)} uncompressed).`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid zip archive';
      setError(`Archive validation failed: ${msg}`);
      setArchiveFile(null);
      setFileTree([]);
    } finally {
      setIsValidatingZip(false);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeArchive = () => {
    setArchiveFile(null);
    setFileTree([]);
    setZipValidationSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setError(null);

    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    if (images.length === 0) {
      setError('Add at least one screenshot or image of your project');
      return;
    }

    if (listingType === 'free') {
      const cleaned = githubUrl.trim();
      if (!cleaned || !/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/i.test(cleaned)) {
        setError('Free Salvage listings require a valid public GitHub URL (e.g. https://github.com/owner/repo)');
        return;
      }
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 1) {
        setError('For Sale listings require a price of at least $1 USD');
        return;
      }
      if (!archiveFile) {
        setError('For Sale listings require uploading a verified .zip source code archive');
        return;
      }
      if (fileTree.length < 3) {
        setError('Uploaded archive contains fewer than 3 source files. Please upload a complete project.');
        return;
      }
    }

    if (!reasonAbandoned.trim()) {
      setError('Please describe why the project stopped / cause of death');
      return;
    }

    if (!salvageableCode.trim()) {
      setError('Please highlight what specific code/file is worth salvaging');
      return;
    }

    if (!agreeTerms) {
      setError('You must confirm code ownership and agree to the Terms of Service to proceed.');
      return;
    }

    setIsSubmitting(true);

    const res = await createProjectRecord(
      {
        title: title.trim(),
        listing_type: listingType,
        price: listingType === 'sale' ? parseFloat(price) : 0,
        github_url: githubUrl.trim(),
        archive_file: archiveFile,
        file_tree: fileTree,
        screenshots: images.map((img) => img.file),
        reason_abandoned: reasonAbandoned.trim(),
        salvageable_code: salvageableCode.trim(),
        tags: parsedTags,
      },
      user
    );

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError(res.error || 'Failed to submit project');
    }
  };

  if (!user) {
    return (
      <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] flex items-center justify-center px-4 py-16 antialiased`}>
        <div className="w-full max-w-md rounded-xl p-8 text-center shadow-[inset_0_0_0_1px_#2a2a2a]">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] mb-2">Sign in to continue</h1>
          <p className="text-sm text-[#8a8a8a] mb-6 leading-relaxed">
            Only registered developers can deposit abandoned projects. Sign in or create an account to proceed.
          </p>

          <div className="space-y-4">
            <Link href="/register" className={primaryBtn}>
              Create an account
            </Link>
            <p className="text-sm text-[#8a8a8a]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#fafafa] hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
            <BackLink />
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="login"
        />
      </div>
    );
  }

  const isSale = listingType === 'sale';

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-20 antialiased`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="mb-6">
          <BackLink />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em]">
          Dump or sell an abandoned project
        </h1>
        <p className="text-sm text-[#8a8a8a] mt-2 max-w-xl">
          Document what you built, why you walked away, and give developers the code to salvage or buy.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {error && <Banner tone="error">{error}</Banner>}
        {success && <Banner tone="success">Project submitted successfully! Redirecting to the feed...</Banner>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
            <Field label="Listing type">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: 'free', title: 'Free Salvage', sub: 'Public GitHub URL' },
                    { value: 'sale', title: 'For Sale', sub: 'Sell source archive' },
                  ] as const
                ).map((opt) => {
                  const active = listingType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setListingType(opt.value)}
                      aria-pressed={active}
                      className={`py-3 px-4 rounded-lg text-sm transition-colors duration-150 flex flex-col items-center gap-0.5 ${focusRing} ${
                        active
                          ? 'bg-[#fafafa] text-[#080808]'
                          : 'border border-[#2a2a2a] text-[#8a8a8a] hover:text-[#fafafa] hover:border-[#3a3a3a]'
                      }`}
                    >
                      <span className="font-medium">{opt.title}</span>
                      <span className="text-xs opacity-70">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Project title" htmlFor="title">
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GraphVector, SQLite Sync Engine, WebGL Shader Toy"
                className={fieldCls}
              />
            </Field>

            {isSale && (
              <>
                <Field
                  label="Price (USD)"
                  htmlFor="price"
                  hint="Platform takes a flat 10% cut. You receive 90% via Stripe Connect."
                >
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8a8a8a]">$</span>
                    <input
                      id="price"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="25"
                      className={`${fieldCls} pl-7`}
                    />
                  </div>
                </Field>

                <Field label="Source code archive (.zip)">
                  <input
                    type="file"
                    ref={zipInputRef}
                    accept=".zip,application/zip"
                    onChange={handleZipChange}
                    className="hidden"
                  />

                  {!archiveFile ? (
                    <button type="button" onClick={() => zipInputRef.current?.click()} className={dropCls}>
                      {isValidatingZip ? (
                        <span className="flex flex-col items-center gap-2 py-1">
                          <Loader2 className="w-5 h-5 text-[#fafafa] animate-spin" />
                          <span className="text-xs text-[#8a8a8a]">Inspecting archive contents...</span>
                        </span>
                      ) : (
                        <span className="flex flex-col items-center gap-1">
                          <FolderArchive className="w-5 h-5 text-[#8a8a8a] mb-1" />
                          <span className="text-sm text-[#fafafa]">Upload .zip source archive</span>
                          <span className="text-xs text-[#8a8a8a]">
                            Minimum 3 source files and 5 KB of code. Max 100MB.
                          </span>
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[#2a2a2a]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderArchive className="w-4 h-4 text-[#8a8a8a] shrink-0" />
                          <span className="text-xs font-mono text-[#fafafa] truncate">{archiveFile.name}</span>
                          <span className="text-xs text-[#8a8a8a] shrink-0">{formatBytes(archiveFile.size)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeArchive}
                          className="text-xs text-[#8a8a8a] hover:text-[#ef4444] transition-colors shrink-0"
                        >
                          Remove
                        </button>
                      </div>

                      {zipValidationSuccess && (
                        <p className="text-xs text-[#22c55e] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{zipValidationSuccess}</span>
                        </p>
                      )}

                      {fileTree.length > 0 && <FileTreePreview files={fileTree} maxInitialDisplay={5} />}
                    </div>
                  )}
                </Field>
              </>
            )}

            <Field
              label="GitHub repository URL"
              htmlFor="githubUrl"
              optional={isSale}
              hint={isSale ? 'If provided, buyers get access to this repository URL after purchasing.' : undefined}
            >
              <input
                id="githubUrl"
                type="url"
                required={!isSale}
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder={
                  isSale
                    ? 'https://github.com/username/private-repo (revealed only upon purchase)'
                    : 'https://github.com/username/abandoned-repo'
                }
                className={`${fieldCls} font-mono text-xs`}
              />
            </Field>

            <Field label="Project screenshots">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {images.length === 0 ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className={dropCls}>
                  <span className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-5 h-5 text-[#8a8a8a] mb-1" />
                    <span className="text-sm text-[#fafafa]">Upload screenshots or UI previews</span>
                    <span className="text-xs text-[#8a8a8a]">
                      At least 1, up to {MAX_PROJECT_IMAGES}. PNG, JPG, WebP up to 5MB each.
                    </span>
                  </span>
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div
                        key={img.id}
                        className="relative aspect-video rounded-lg overflow-hidden shadow-[inset_0_0_0_1px_#2a2a2a] bg-[#141414]"
                      >
                        <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium text-[#fafafa] bg-[#080808]/85 rounded-md">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className={`absolute top-1.5 right-1.5 p-1 bg-[#080808]/90 hover:bg-[#141414] text-[#b8b8b8] hover:text-[#fafafa] rounded-md transition-colors ${focusRing}`}
                          title="Remove image"
                          aria-label={`Remove image ${i + 1}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {images.length < MAX_PROJECT_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-video rounded-lg border border-dashed border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#141414] text-[#8a8a8a] hover:text-[#fafafa] flex flex-col items-center justify-center gap-1 text-xs transition-colors ${focusRing}`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Add more</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#737373]">
                    {images.length} of {MAX_PROJECT_IMAGES}. The first image is the cover shown in the catalog.
                  </p>
                </>
              )}
            </Field>

            <Field label="Why did you abandon it?" htmlFor="reason">
              <textarea
                id="reason"
                required
                rows={3}
                value={reasonAbandoned}
                onChange={(e) => setReasonAbandoned(e.target.value)}
                placeholder="Be brutally honest: Did competitors ship first? Did AWS bills explode? Did Chrome MV3 break your background workers? Real postmortems help everyone."
                className={`${fieldCls} leading-relaxed`}
              />
            </Field>

            <Field label="What is worth salvaging?" htmlFor="salvage">
              <textarea
                id="salvage"
                required
                rows={4}
                value={salvageableCode}
                onChange={(e) => setSalvageableCode(e.target.value)}
                placeholder="Give exact file paths and functions. e.g. 'crates/simd/distance.rs has a standalone zero-allocation cosine distance routine that compiles without external dependencies.'"
                className={`${fieldCls} leading-relaxed font-mono text-xs`}
              />
            </Field>

            <Field label="Tags" htmlFor="tags" optional hint="Separate with commas.">
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="TypeScript, SQLite, WebGL, Algorithms, Parser"
                className={`${fieldCls} font-mono text-xs`}
              />
            </Field>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#3a3a3a] bg-[#141414] accent-[#fafafa] focus:ring-0"
              />
              <span className="text-xs text-[#8a8a8a] leading-relaxed">
                I confirm I own the copyright and rights to this source code, wrote or legitimately acquired it,
                and agree to the{' '}
                <Link href="/terms" target="_blank" className="text-[#fafafa] underline underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/refunds" target="_blank" className="text-[#fafafa] underline underline-offset-2">
                  Refund Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || isValidatingZip || success}
              className={primaryBtn}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing project...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isSale ? `Publish listing for $${price || '0'}` : 'Publish free salvage project'}</span>
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
            <ProjectPreview
              title={title}
              tags={parsedTags}
              images={images.map((img) => img.preview)}
              username={user.username}
              avatarUrl={getAvatarUrl(user) || undefined}
              githubUrl={githubUrl}
              reasonAbandoned={reasonAbandoned}
              salvageableCode={salvageableCode}
              isForSale={isSale}
              price={isSale ? parseFloat(price) || 0 : 0}
              filesCount={fileTree.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}