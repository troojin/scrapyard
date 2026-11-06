'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '@/types';
import { getFileUrl, getAvatarUrl } from '@/lib/pocketbase';
import { hasUserPurchasedProject } from '@/lib/projectsApi';
import { useAuth } from '@/context/AuthContext';
import { FileTreePreview } from './FileTreePreview';
import { Inter } from 'next/font/google';
import { getProjectImages } from '@/lib/projectImages';
import {
  X,
  Copy,
  Check,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  Unlock,
  ShieldCheck,
  CreditCard,
  Loader2,
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = isOpen && !!project;
  const imageCount = project ? getProjectImages(project).length : 0;
  const isForSale = !!project?.is_for_sale && typeof project.price === 'number' && project.price > 0;
  const isAuthor = !!(user && project && user.id === project.user);

  useEffect(() => {
    if (!visible || !project) return;

    if (isForSale && user && !isAuthor) {
      let active = true;
      setCheckingPurchase(true);
      hasUserPurchasedProject(user.id, project.id).then((purchased) => {
        if (active) {
          setIsPurchased(purchased);
          setCheckingPurchase(false);
        }
      });
      return () => {
        active = false;
      };
    } else {
      setIsPurchased(false);
      setCheckingPurchase(false);
    }
  }, [visible, project, user, isForSale, isAuthor]);

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (imageCount > 1 && e.key === 'ArrowRight') setImageIndex((i) => (i + 1) % imageCount);
      if (imageCount > 1 && e.key === 'ArrowLeft') setImageIndex((i) => (i - 1 + imageCount) % imageCount);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (copyTimer.current) clearTimeout(copyTimer.current);
      setCopied(false);
      setImageIndex(0);
      setCheckoutError(null);
      setIsCheckingOut(false);
    };
  }, [visible, onClose, imageCount]);

  if (!visible || !project || !mounted) return null;

  const canAccessSource = !isForSale || isAuthor || isPurchased;

  const images = getProjectImages(project);
  const safeIndex = Math.min(imageIndex, Math.max(images.length - 1, 0));
  const currentImageUrl = images.length > 0 ? getFileUrl(project, images[safeIndex]) : '';
  const goPrev = () => setImageIndex((safeIndex - 1 + images.length) % images.length);
  const goNext = () => setImageIndex((safeIndex + 1) % images.length);
  const githubUrl = canAccessSource ? safeUrl(project.github_url) : null;

  const author = project.expand?.user;
  const authorAvatar = getAvatarUrl(author);
  const authorName = author?.username || 'anonymous';

  const formattedDate = project.created
    ? new Date(project.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  const copySalvageCode = async () => {
    try {
      await navigator.clipboard.writeText(project.salvageable_code);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const handleBuy = async () => {
    if (!user) {
      setCheckoutError('Please sign in to purchase and download this codebase.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          buyerId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to start checkout session.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout initiation failed';
      setCheckoutError(msg);
      setIsCheckingOut(false);
    }
  };

  const downloadUrl = `/api/projects/${project.id}/download?userId=${user?.id || ''}`;

  return createPortal(
    <div
      onClick={onClose}
      className={`${inter.className} fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs antialiased animate-backdrop`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden bg-[#080808] rounded-xl shadow-[inset_0_0_0_1px_#2a2a2a] text-[#fafafa] animate-modal will-change-transform"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 z-10 text-[#8a8a8a] hover:text-[#fafafa] bg-[#080808] p-1 rounded-md transition-colors ${focusRing}`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
          <div className="flex items-center justify-between gap-3 mb-5 pr-8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] shrink-0 flex items-center justify-center">
                {authorAvatar ? (
                  <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#5c5c5c]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-[#fafafa] font-medium truncate">{authorName}</div>
                {formattedDate && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a]">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              {isForSale ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#fafafa]">${project.price}</span>
                  {isAuthor ? (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#141414] text-[#8a8a8a] border border-[#2a2a2a]">
                      Your Listing
                    </span>
                  ) : isPurchased ? (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 inline-flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Purchased</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#fafafa] text-[#080808]">
                      For Sale
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#141414] text-[#8a8a8a] border border-[#2a2a2a]">
                  Free Salvage
                </span>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#fafafa] break-words mb-5">
            {project.title}
          </h2>

          {currentImageUrl && (
            <div className="mb-5">
              <div className="relative rounded-lg overflow-hidden shadow-[inset_0_0_0_1px_#2a2a2a] bg-[#141414]">
                <img
                  key={currentImageUrl}
                  src={currentImageUrl}
                  alt={`${project.title} image ${safeIndex + 1} of ${images.length}`}
                  className="w-full h-auto max-h-[48vh] object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Previous image"
                      className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#080808]/80 hover:bg-[#080808] text-[#fafafa] rounded-full border border-[#2a2a2a] transition-colors ${focusRing}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next image"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#080808]/80 hover:bg-[#080808] text-[#fafafa] rounded-full border border-[#2a2a2a] transition-colors ${focusRing}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[11px] font-medium text-[#fafafa] bg-[#080808]/80 rounded-md border border-[#2a2a2a]">
                      {safeIndex + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
                  {images.map((image, i) => (
                    <button
                      key={`${image}-${i}`}
                      type="button"
                      onClick={() => setImageIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === safeIndex}
                      className={`shrink-0 w-16 h-12 rounded-md overflow-hidden bg-[#141414] transition-[opacity,box-shadow] ${focusRing} ${
                        i === safeIndex
                          ? 'shadow-[0_0_0_2px_#fafafa]'
                          : 'opacity-60 hover:opacity-100 shadow-[inset_0_0_0_1px_#2a2a2a]'
                      }`}
                    >
                      <img
                        src={getFileUrl(project, image, '200x150')}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-md text-[#8a8a8a] shadow-[inset_0_0_0_1px_#2a2a2a]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isForSale && !canAccessSource && (
            <div className="mb-6 p-5 rounded-xl border border-[#2a2a2a] bg-[#0c0c0c] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-[#8a8a8a]" />
                    <span className="text-sm font-semibold text-[#fafafa]">
                      Purchase Source Archive
                    </span>
                  </div>
                  <p className="text-xs text-[#8a8a8a]">
                    Instant access to uncompressed source code, configs, and commercial salvage rights.
                  </p>
                </div>
                <div className="text-2xl font-bold text-[#fafafa] shrink-0">
                  ${project.price} <span className="text-xs font-normal text-[#8a8a8a]">USD</span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                onClick={handleBuy}
                disabled={isCheckingOut || checkingPurchase}
                className={`w-full py-3 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-semibold text-sm rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(250,250,250,0.2)] ${focusRing}`}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting to Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Buy Commercial License · ${project.price}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Scam-Proof Verified Archive. 48-hour misrepresentation protection.</span>
              </div>
            </div>
          )}

          {project.file_tree && project.file_tree.length > 0 && (
            <div className="mb-6">
              <FileTreePreview files={project.file_tree} />
            </div>
          )}

          {canAccessSource && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-[#fafafa] hover:bg-white text-[#080808] text-sm font-medium rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] ${focusRing}`}
                >
                  <GitHubIcon />
                  <span>View on GitHub</span>
                </a>
              )}

              {project.archive_file && (
                <a
                  href={downloadUrl}
                  download
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] text-[#fafafa] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm font-medium rounded-lg transition-colors active:scale-[0.98] ${focusRing}`}
                >
                  <Download className="w-4 h-4 text-[#22c55e]" />
                  <span>Download .zip Archive</span>
                </a>
              )}

              {isForSale && (
                <span className="text-xs text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/25 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAuthor ? 'Listing Author Access' : 'Verified License Active'}</span>
                </span>
              )}
            </div>
          )}

          <div className="space-y-4">
            {project.reason_abandoned && (
              <section className="p-4 rounded-lg shadow-[inset_0_0_0_1px_#2a2a2a]">
                <h3 className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-[0.05em] mb-2">
                  Why it stopped
                </h3>
                <p className="text-sm text-[#b8b8b8] leading-relaxed whitespace-pre-wrap break-words">
                  {project.reason_abandoned}
                </p>
              </section>
            )}

            {project.salvageable_code && (
              <section className="p-4 rounded-lg shadow-[inset_0_0_0_1px_#2a2a2a]">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-[0.05em]">
                    Salvageable code snippet
                  </h3>
                  <button
                    type="button"
                    onClick={copySalvageCode}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-transparent hover:bg-[#141414] text-[#fafafa] rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors ${focusRing}`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#22c55e]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-[#b8b8b8] whitespace-pre-wrap break-words bg-[#141414] p-3 rounded-lg leading-relaxed max-h-48 overflow-y-auto">
                  {project.salvageable_code}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
