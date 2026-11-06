'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fetchProjects } from '@/lib/projectsApi';
import { ProjectCard } from '@/components/ProjectCard';
import { TagFilter } from '@/components/TagFilter';
import { useFeedFilter, TAG_FILTERS } from '@/context/FeedFilterContext';
import type { Project } from '@/types';
import { Inter } from 'next/font/google';
import { Search, RefreshCw, X } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

export default function FeedPage() {
  const {
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    listingType,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    docked,
    setDocked,
    resetFilters,
  } = useFeedFilter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const minNum = minPrice.trim() ? parseFloat(minPrice) : undefined;
      const maxNum = maxPrice.trim() ? parseFloat(maxPrice) : undefined;

      const data = await fetchProjects({
        search: search.trim() || undefined,
        tag: selectedTag === 'All' ? undefined : selectedTag,
        listingType,
        minPrice: isNaN(minNum as number) ? undefined : minNum,
        maxPrice: isNaN(maxNum as number) ? undefined : maxNum,
      });

      if (!cancelled) {
        setProjects(data);
        setLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, selectedTag, listingType, minPrice, maxPrice, refreshKey]);

  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setDocked(!entry.isIntersecting && entry.boundingClientRect.top < 64);
      },
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setDocked(false);
    };
  }, [setDocked]);

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const isFiltered =
    selectedTag !== 'All' || listingType !== 'all' || !!minPrice || !!maxPrice || !!search.trim();

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-20 antialiased`}>
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white leading-tight">
              Sell it or give it away.
              <br />
              <span className="text-white font-medium">
                Find unfinished projects, and the modules, parsers, shaders, and configs inside them that still work.
              </span>
            </h1>
          </div>

          <div
            ref={controlsRef}
            className={`mt-10 max-w-2xl mx-auto flex flex-col gap-3.5 transition-all duration-300 ease-out ${
              docked ? 'md:opacity-0 md:scale-95 md:pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#5c5c5c]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, tag, or file name..."
                className={`w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl px-4 py-3.5 pl-11 text-base text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <TagFilter
                tags={TAG_FILTERS}
                selected={selectedTag}
                onSelect={setSelectedTag}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={handlePriceChange}
              />

              <button
                type="button"
                onClick={() => setRefreshKey((k) => k + 1)}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-transparent hover:bg-[#141414] text-[#fafafa] text-sm font-medium rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors active:scale-[0.98] ${focusRing}`}
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8a8a8a] hover:text-[#ef4444] transition-colors"
                  title="Clear all active filters"
                >
                  <X className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa]">Catalog</h2>
            {listingType !== 'all' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#141414] border border-[#2a2a2a] text-[#a3a3a3]">
                {listingType === 'free' ? 'Free Salvage only' : 'For Sale only'}
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#141414] border border-[#2a2a2a] text-[#a3a3a3]">
                {minPrice && maxPrice ? `$${minPrice}–$${maxPrice}` : minPrice ? `>$${minPrice}` : `<$${maxPrice}`}
              </span>
            )}
          </div>
          <span className="text-xs text-[#8a8a8a]">
            {loading ? 'Loading...' : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#080808]"
              >
                <div className="aspect-video animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 rounded w-1/3 animate-shimmer" />
                  <div className="h-5 rounded w-3/4 animate-shimmer" />
                  <div className="h-3 rounded w-1/2 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2a2a2a] rounded-xl my-6 bg-[#0c0c0c]">
            <Search className="w-8 h-8 mx-auto text-[#3a3a3a] mb-3" />
            <h3 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa] mb-1">
              No projects found
            </h3>
            <p className="text-sm text-[#8a8a8a] max-w-sm mx-auto mb-5">
              Nothing matched your search, tag, or price filter. Try adjusting your parameters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className={`px-4 py-2 text-sm font-medium bg-[#fafafa] hover:bg-white text-[#080808] rounded-lg transition-[background-color,transform] active:scale-[0.98] ${focusRing}`}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}