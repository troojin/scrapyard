'use client';

import React, { useEffect, useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selected: string;
  onSelect: (tag: string) => void;
  allLabel?: string;
}

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

export function TagFilter({ tags, selected, onSelect, allLabel = 'All' }: TagFilterProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleSelect = (tag: string) => {
    onSelect(tag);
    setOpen(false);
  };

  const isFiltered = selected !== allLabel;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-lg border transition-colors active:scale-[0.98] ${focusRing} ${
          isFiltered
            ? 'bg-[#141414] border-[#3a3a3a] text-[#fafafa]'
            : 'bg-transparent hover:bg-[#141414] border-[#2a2a2a] hover:border-[#3a3a3a] text-[#fafafa]'
        }`}
      >
        <Filter className="w-3.5 h-3.5" />
        <span>{isFiltered ? `Tag: ${selected}` : 'Tag'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8a8a8a]" />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter by tag"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#080808] rounded-xl p-8 shadow-[inset_0_0_0_1px_#2a2a2a] text-[#fafafa] max-h-[calc(100vh-2rem)] overflow-y-auto animate-modal will-change-transform"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className={`absolute top-4 right-4 text-[#8a8a8a] hover:text-[#fafafa] p-1 rounded-md transition-colors ${focusRing}`}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-center mb-2">
              Filter by tag
            </h2>
            <p className="text-sm text-[#8a8a8a] text-center mb-6">
              Pick a tag to narrow down the catalog.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelect(tag)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${focusRing} ${
                    selected === tag
                      ? 'bg-[#fafafa] text-[#080808]'
                      : 'bg-transparent text-[#8a8a8a] hover:text-[#fafafa] hover:bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
