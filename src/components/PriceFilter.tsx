'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFeedFilter } from '@/context/FeedFilterContext';
import { DollarSign, ChevronDown, X, Check } from 'lucide-react';

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

const PRESETS = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under $25', min: '0', max: '25' },
  { label: '$25 – $50', min: '25', max: '50' },
  { label: '$50 – $100', min: '50', max: '100' },
  { label: '$100+', min: '100', max: '' },
];

export function PriceFilter() {
  const { minPrice, setMinPrice, maxPrice, setMaxPrice } = useFeedFilter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const hasFilter = !!(minPrice || maxPrice);

  const filterSummary = hasFilter
    ? minPrice && maxPrice
      ? `$${minPrice}–$${maxPrice}`
      : minPrice
      ? `>$${minPrice}`
      : `<$${maxPrice}`
    : 'Price';

  const applyPreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setOpen(false);
  };

  const clearPrice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-150 active:scale-[0.98] ${focusRing} ${
          hasFilter
            ? 'bg-[#141414] border-[#3a3a3a] text-[#fafafa]'
            : 'bg-transparent hover:bg-[#141414] border-[#2a2a2a] hover:border-[#3a3a3a] text-[#8a8a8a] hover:text-[#fafafa]'
        }`}
      >
        <DollarSign className="w-3.5 h-3.5 text-[#8a8a8a]" />
        <span>{filterSummary}</span>
        {hasFilter ? (
          <span
            onClick={clearPrice}
            className="p-0.5 hover:text-[#ef4444] rounded transition-colors ml-0.5"
            title="Clear price filter"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#8a8a8a]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 p-4 bg-[#0c0c0c] border border-[#2a2a2a] rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-30 animate-dropdown">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2a2a2a]">
            <span className="text-xs font-semibold text-[#fafafa]">Price Range (USD)</span>
            {hasFilter && (
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-[11px] text-[#ef4444] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <label htmlFor="min-price-input" className="block text-[10px] uppercase font-mono text-[#8a8a8a] mb-1">
                Min ($)
              </label>
              <input
                id="min-price-input"
                type="number"
                min="0"
                step="5"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#fafafa]/40 font-mono"
              />
            </div>
            <div>
              <label htmlFor="max-price-input" className="block text-[10px] uppercase font-mono text-[#8a8a8a] mb-1">
                Max ($)
              </label>
              <input
                id="max-price-input"
                type="number"
                min="0"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="100"
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fafafa] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#fafafa]/40 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono text-[#8a8a8a] mb-1.5">Quick Presets</span>
            {PRESETS.map((p) => {
              const active = minPrice === p.min && maxPrice === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.min, p.max)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                    active
                      ? 'bg-[#fafafa] text-[#080808] font-medium'
                      : 'text-[#8a8a8a] hover:text-[#fafafa] hover:bg-[#141414]'
                  }`}
                >
                  <span>{p.label}</span>
                  {active && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
