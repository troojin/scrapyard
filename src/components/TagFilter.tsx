'use client';

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CardModal } from '@/components/CardModal';

const PRICE_MAX = 500;
const STEP = 5;

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

const thumb =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#fafafa] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#080808] [&::-webkit-slider-thumb]:cursor-pointer ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#fafafa] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#080808] [&::-moz-range-thumb]:cursor-pointer';

const rangeCls = `absolute inset-x-0 top-0 w-full h-4 m-0 appearance-none bg-transparent pointer-events-none focus:outline-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ${thumb}`;

interface TagFilterProps {
  tags: readonly string[];
  selected: string;
  onSelect: (tag: string) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
  /** Extra classes for the trigger button only (e.g. a fixed height). */
  triggerClassName?: string;
}

export function TagFilter({
  tags,
  selected,
  onSelect,
  minPrice,
  maxPrice,
  onPriceChange,
  triggerClassName = '',
}: TagFilterProps) {
  const [open, setOpen] = useState(false);

  // Draft values: edited inside the card, only applied when "Done" is pressed.
  const [draftTag, setDraftTag] = useState(selected);
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);

  const toNum = (v: string, fallback: number) =>
    Math.min(Math.max(v ? parseFloat(v) || fallback : fallback, 0), PRICE_MAX);

  // Applied values (what the feed is actually using) drive the badge.
  const appliedLo = toNum(minPrice, 0);
  const appliedHi = toNum(maxPrice, PRICE_MAX);
  const activeCount =
    (selected !== 'All' ? 1 : 0) + (appliedLo > 0 || appliedHi < PRICE_MAX ? 1 : 0);

  // Draft values drive the controls inside the card.
  const lo = toNum(draftMin, 0);
  const hi = toNum(draftMax, PRICE_MAX);
  const draftTagActive = draftTag !== 'All';
  const draftPriceActive = lo > 0 || hi < PRICE_MAX;

  const openCard = () => {
    setDraftTag(selected);
    setDraftMin(minPrice);
    setDraftMax(maxPrice);
    setOpen(true);
  };

  const applyAndClose = () => {
    onSelect(draftTag);
    onPriceChange(draftMin, draftMax);
    setOpen(false);
  };

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), hi - STEP);
    setDraftMin(v <= 0 ? '' : String(v));
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), lo + STEP);
    setDraftMax(v >= PRICE_MAX ? '' : String(v));
  };

  const leftPct = (lo / PRICE_MAX) * 100;
  const widthPct = ((hi - lo) / PRICE_MAX) * 100;

  return (
    <>
      <button
        type="button"
        onClick={openCard}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-[#141414] text-[#fafafa] text-sm font-medium rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors active:scale-[0.98] ${focusRing} ${triggerClassName}`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#8a8a8a]" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#fafafa] text-[#080808] leading-none">
            {activeCount}
          </span>
        )}
      </button>

      <CardModal open={open} onClose={() => setOpen(false)} label="Filters" maxWidthClass="max-w-md">
        <div className="p-6 space-y-8">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#fafafa]">Filters</h2>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-[#fafafa]">Tag</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = draftTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDraftTag(tag)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${focusRing} ${
                      active
                        ? 'bg-[#fafafa] text-[#080808] border-[#fafafa] font-medium'
                        : 'bg-transparent text-[#a3a3a3] border-[#2a2a2a] hover:text-[#fafafa] hover:border-[#3a3a3a]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-medium text-[#fafafa]">Price</h3>
              <span className="text-sm font-mono text-[#a3a3a3]">
                ${lo} – {hi >= PRICE_MAX ? `$${PRICE_MAX}+` : `$${hi}`}
              </span>
            </div>

            <div className="relative h-4 mx-2">
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1 rounded-full bg-[#2a2a2a]" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#fafafa]"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={STEP}
                value={lo}
                onChange={handleMin}
                aria-label="Minimum price"
                className={rangeCls}
                style={{ zIndex: lo > PRICE_MAX - 40 ? 5 : 3 }}
              />
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={STEP}
                value={hi}
                onChange={handleMax}
                aria-label="Maximum price"
                className={rangeCls}
                style={{ zIndex: 4 }}
              />
            </div>

            <div className="flex justify-between text-xs text-[#5c5c5c] mx-1">
              <span>$0</span>
              <span>${PRICE_MAX}+</span>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setDraftTag('All');
                setDraftMin('');
                setDraftMax('');
              }}
              disabled={!draftTagActive && !draftPriceActive}
              className={`text-sm text-[#8a8a8a] hover:text-[#fafafa] disabled:opacity-40 disabled:hover:text-[#8a8a8a] transition-colors ${focusRing}`}
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={applyAndClose}
              className={`px-5 py-2 bg-[#fafafa] hover:bg-white text-[#080808] text-sm font-medium rounded-lg transition-[background-color,transform] active:scale-[0.98] ${focusRing}`}
            >
              Done
            </button>
          </div>
        </div>
      </CardModal>
    </>
  );
}

export default TagFilter;