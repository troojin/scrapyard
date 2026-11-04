'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createProjectRecord } from '@/lib/projectsApi';
import { AuthModal } from '@/components/AuthModal';
import { Inter } from 'next/font/google';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  GitBranch,
  Code2,
  Skull,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';
const labelCls =
  'flex items-center gap-1.5 text-[11px] font-medium text-[#8a8a8a] mb-2 uppercase tracking-[0.05em]';
const fieldCls = `w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`;
const primaryBtn = `group w-full py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100 ${focusRing}`;

export default function SubmitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [reasonAbandoned, setReasonAbandoned] = useState('');
  const [salvageableCode, setSalvageableCode] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshotPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    if (!githubUrl.trim().startsWith('http')) {
      setError('Please provide a valid GitHub repository URL starting with https://');
      return;
    }

    if (!reasonAbandoned.trim()) {
      setError('Please describe why the project stopped / cause of death');
      return;
    }

    if (!salvageableCode.trim()) {
      setError('Please highlight what specific code/file is worth salvaging');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);

    const res = await createProjectRecord(
      {
        title: title.trim(),
        github_url: githubUrl.trim(),
        screenshot: screenshotFile,
        reason_abandoned: reasonAbandoned.trim(),
        salvageable_code: salvageableCode.trim(),
        tags,
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
        <div className="w-full max-w-md bg-[#080808] rounded-xl p-8 text-center shadow-[inset_0_0_0_1px_#2a2a2a]">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#fafafa] mb-2">
            Sign in to continue
          </h1>
          <p className="text-sm text-[#8a8a8a] mb-6 leading-relaxed">
            Only registered developers can deposit abandoned projects. Sign in or create an account to
            proceed.
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
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Back to catalog</span>
            </Link>
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

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-20 antialiased`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to catalog</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-transparent hover:bg-[#141414] text-[#fafafa] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors ${focusRing}`}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? 'Hide live preview' : 'Show live preview'}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#fafafa]">
          Dump an abandoned project
        </h1>
        <p className="text-sm text-[#8a8a8a] mt-2 max-w-xl">
          Document what you built, why you walked away, and guide other developers to the code worth
          reusing.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[#ef4444]/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.35)] text-[#fca5a5] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px text-[#ef4444]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-[#22c55e]/10 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.35)] text-[#86efac] text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-px text-[#22c55e]" />
            <span>Project submitted! Redirecting to the feed...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${showPreview ? 'lg:col-span-7' : 'lg:col-span-12 max-w-2xl'}`}
          >
            <div>
              <label htmlFor="title" className={labelCls}>
                <span>Project Title</span> <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GraphVector, SQLite Sync Engine, WebGL Shader Toy"
                className={fieldCls}
              />
            </div>

            <div>
              <label htmlFor="githubUrl" className={labelCls}>
                <GitBranch className="w-3.5 h-3.5" />
                <span>GitHub Repository URL</span> <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="githubUrl"
                type="url"
                required
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/abandoned-repo"
                className={`${fieldCls} font-mono text-xs`}
              />
            </div>

            <div>
              <span className={labelCls}>Project Screenshot / Architecture Diagram</span>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {screenshotPreview ? (
                <div className="relative rounded-lg overflow-hidden shadow-[inset_0_0_0_1px_#2a2a2a] bg-[#080808] aspect-video">
                  <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className={`p-1.5 bg-[#080808]/90 hover:bg-[#141414] text-[#b8b8b8] hover:text-[#fafafa] rounded-md border border-[#2a2a2a] transition-colors ${focusRing}`}
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#141414] rounded-lg p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] text-[#8a8a8a] flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-[#fafafa] block mb-1">
                    Click to upload a screenshot or UI preview
                  </span>
                  <span className="text-xs text-[#8a8a8a] block">PNG, JPG, WebP up to 5MB</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reason" className={labelCls}>
                <Skull className="w-3.5 h-3.5" />
                <span>Why Did You Abandon It? (Cause of Death)</span>{' '}
                <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                id="reason"
                required
                rows={3}
                value={reasonAbandoned}
                onChange={(e) => setReasonAbandoned(e.target.value)}
                placeholder="Be brutally honest: Did competitors ship first? Did AWS bills explode? Did Chrome MV3 break your background workers? Real postmortems help everyone."
                className={`${fieldCls} leading-relaxed`}
              />
            </div>

            <div>
              <label htmlFor="salvage" className={labelCls}>
                <Code2 className="w-3.5 h-3.5" />
                <span>What Code/File Is Worth Salvaging?</span>{' '}
                <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                id="salvage"
                required
                rows={4}
                value={salvageableCode}
                onChange={(e) => setSalvageableCode(e.target.value)}
                placeholder="Give exact file paths and functions. e.g. 'crates/simd/distance.rs has a standalone zero-allocation cosine distance routine that compiles without external dependencies.'"
                className={`${fieldCls} leading-relaxed font-mono text-xs`}
              />
            </div>

            <div>
              <label htmlFor="tags" className={labelCls}>Tags (Comma-separated)</label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="TypeScript, SQLite, WebGL, Algorithms, Parser"
                className={`${fieldCls} font-mono text-xs`}
              />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isSubmitting || success} className={primaryBtn}>
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publish Project</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {showPreview && (
            <div className="lg:col-span-5 sticky top-24 self-start">
              <div className="rounded-xl p-4 shadow-[inset_0_0_0_1px_#2a2a2a]">
                <span className="block text-[11px] font-medium text-[#8a8a8a] uppercase tracking-[0.05em] mb-3">
                  Live Card Preview
                </span>
                <div className="rounded-lg overflow-hidden shadow-[inset_0_0_0_1px_#2a2a2a]">
                  <div className="aspect-video bg-[#141414] relative">
                    {screenshotPreview ? (
                      <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5c5c5c] text-xs">
                        No screenshot
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8a8a8a]">{user.username}</span>
                    </div>
                    <h3 className="font-semibold text-[#fafafa] text-sm tracking-[-0.01em]">
                      {title || 'Untitled Project'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}