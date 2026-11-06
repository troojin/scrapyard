'use client';

import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import { Image as ImageIcon, ArrowRight, User, Calendar, ChevronLeft, ChevronRight, FolderArchive } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

interface ProjectPreviewProps {
  title: string;
  tags: string[];
  images: string[];
  username: string;
  avatarUrl?: string;
  githubUrl: string;
  reasonAbandoned: string;
  salvageableCode: string;
  isForSale?: boolean;
  price?: number;
  filesCount?: number;
}

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function isWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function ProjectPreview({
  title,
  tags,
  images,
  username,
  avatarUrl,
  githubUrl,
  reasonAbandoned,
  salvageableCode,
  isForSale,
  price,
  filesCount = 0,
}: ProjectPreviewProps) {
  const [view, setView] = useState<'card' | 'details'>('card');
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (imageIndex > Math.max(images.length - 1, 0)) setImageIndex(0);
  }, [images.length, imageIndex]);

  const displayTitle = title.trim() || 'Untitled project';
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const todayLong = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const safeIndex = Math.min(imageIndex, Math.max(images.length - 1, 0));
  const hasGithub = isWebUrl(githubUrl.trim());

  const tabCls = (active: boolean) =>
    `py-2 text-[13px] font-medium rounded-md transition-colors ${focusRing} ${
      active
        ? 'bg-[#141414] text-[#fafafa] shadow-[inset_0_0_0_1px_#2a2a2a]'
        : 'text-[#8a8a8a] hover:text-[#fafafa]'
    }`;

  return (
    <div className={`${inter.className} antialiased`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-[0.05em]">
          Live preview
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-[#2a2a2a] mb-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'card'}
          onClick={() => setView('card')}
          className={tabCls(view === 'card')}
        >
          Project card
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'details'}
          onClick={() => setView('details')}
          className={tabCls(view === 'details')}
        >
          Details
        </button>
      </div>

      {view === 'card' ? (
        <article className="bg-[#080808] rounded-xl overflow-hidden flex flex-col justify-between border border-[#2a2a2a]">
          <div>
            <div className="relative aspect-video w-full bg-[#141414] overflow-hidden border-b border-[#2a2a2a]">
              {images[0] ? (
                <img src={images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#5c5c5c]">
                  <ImageIcon className="w-7 h-7 mb-2 text-[#3a3a3a]" />
                  <span className="text-xs">No screenshot</span>
                </div>
              )}

              <div className="absolute top-3 right-3 z-10">
                {isForSale ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#fafafa] text-[#080808] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                    ${price || 0}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#080808]/80 text-[#a3a3a3] border border-[#2a2a2a]">
                    Free Salvage
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 min-w-0 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#141414] border border-[#2a2a2a] shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1e1e1e]" />
                    )}
                  </div>
                  <span className="text-xs text-[#8a8a8a] truncate">{username}</span>
                  <span className="text-xs text-[#5c5c5c]">· {today}</span>
                </div>

                {filesCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#8a8a8a] font-mono shrink-0">
                    <FolderArchive className="w-3 h-3 text-[#5c5c5c]" />
                    <span>{filesCount} files</span>
                  </span>
                )}
              </div>

              <h3
                className={`text-base font-semibold tracking-[-0.01em] mb-3 break-words ${
                  title.trim() ? 'text-[#fafafa]' : 'text-[#5c5c5c]'
                }`}
              >
                {displayTitle}
              </h3>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md text-[#8a8a8a] border border-[#2a2a2a]"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-[11px] text-[#5c5c5c] self-center">+{tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#8a8a8a] inline-flex items-center gap-1">
              <span>{isForSale ? `View details · $${price || 0}` : 'View details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </article>
      ) : (
        <div className="bg-[#080808] rounded-xl shadow-[inset_0_0_0_1px_#2a2a2a] text-[#fafafa] max-h-[70vh] overflow-y-auto p-6 [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#5c5c5c]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-[#fafafa] font-medium truncate">{username}</div>
                <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a]">
                  <Calendar className="w-3 h-3" />
                  <span>{todayLong}</span>
                </div>
              </div>
            </div>

            <div>
              {isForSale ? (
                <span className="text-base font-bold text-[#fafafa]">${price || 0}</span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#141414] text-[#8a8a8a] border border-[#2a2a2a]">
                  Free
                </span>
              )}
            </div>
          </div>

          <h2
            className={`text-2xl font-semibold tracking-[-0.025em] break-words mb-5 ${
              title.trim() ? 'text-[#fafafa]' : 'text-[#5c5c5c]'
            }`}
          >
            {displayTitle}
          </h2>

          <div className="mb-5">
            <div className="relative rounded-lg overflow-hidden shadow-[inset_0_0_0_1px_#2a2a2a] bg-[#141414]">
              {images.length > 0 ? (
                <img
                  src={images[safeIndex]}
                  alt=""
                  className="w-full h-auto max-h-[40vh] object-contain"
                />
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-[#5c5c5c]">
                  <ImageIcon className="w-7 h-7 mb-2 text-[#3a3a3a]" />
                  <span className="text-xs">No images yet</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((safeIndex - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#080808]/80 hover:bg-[#080808] text-[#fafafa] rounded-full border border-[#2a2a2a] transition-colors ${focusRing}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((safeIndex + 1) % images.length)}
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
                    key={`${image.slice(-24)}-${i}`}
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
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-md text-[#8a8a8a] shadow-[inset_0_0_0_1px_#2a2a2a]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isForSale ? (
            <div className="mb-6 p-4 rounded-lg border border-[#2a2a2a] bg-[#141414] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#fafafa] block">For Sale · ${price || 0}</span>
                <span className="text-[11px] text-[#8a8a8a]">Source code unlockable upon purchase</span>
              </div>
              <button
                type="button"
                className="px-3.5 py-2 bg-[#fafafa] text-[#080808] font-semibold text-xs rounded-lg"
              >
                Buy ${price || 0}
              </button>
            </div>
          ) : (
            <span
              className={`inline-flex items-center gap-2 px-4 py-2.5 mb-6 bg-[#fafafa] text-[#080808] text-sm font-medium rounded-lg ${
                hasGithub ? '' : 'opacity-40'
              }`}
            >
              <GitHubIcon />
              <span>View on GitHub</span>
            </span>
          )}

          <div className="space-y-4">
            <section className="p-4 rounded-lg shadow-[inset_0_0_0_1px_#2a2a2a]">
              <h3 className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-[0.05em] mb-2">
                Why it stopped
              </h3>
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  reasonAbandoned.trim() ? 'text-[#b8b8b8]' : 'text-[#5c5c5c]'
                }`}
              >
                {reasonAbandoned.trim() || 'Why you stopped working on it will show up here.'}
              </p>
            </section>

            <section className="p-4 rounded-lg shadow-[inset_0_0_0_1px_#2a2a2a]">
              <h3 className="text-[11px] font-medium text-[#8a8a8a] uppercase tracking-[0.05em] mb-3">
                Salvageable code
              </h3>
              <div
                className={`font-mono text-xs whitespace-pre-wrap break-words bg-[#141414] p-3 rounded-lg leading-relaxed max-h-48 overflow-y-auto ${
                  salvageableCode.trim() ? 'text-[#b8b8b8]' : 'text-[#5c5c5c]'
                }`}
              >
                {salvageableCode.trim() || 'The files and functions worth reusing will show up here.'}
              </div>
            </section>
          </div>
        </div>
      )}

      <p className="text-xs text-[#5c5c5c] mt-3">
        {view === 'card'
          ? 'Cards in the catalog only show the first image.'
          : 'This is what opens when someone clicks the card.'}
      </p>
    </div>
  );
}
