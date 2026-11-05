'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { fetchProjects } from '@/lib/projectsApi';
import { ProjectCard } from '@/components/ProjectCard';
import { TagFilter } from '@/components/TagFilter';
import type { Project } from '@/types';
import { Inter } from 'next/font/google';
import { Search, RefreshCw } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

const TAG_FILTERS = [
  'All',
  'TypeScript',
  'Rust',
  'Go',
  'JavaScript',
  'Algorithms',
  'Security',
  'WebGL',
  'Game Dev',
];

export default function FeedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadProjects = async (searchTerm = search, tag = selectedTag) => {
    setLoading(true);
    const data = await fetchProjects({
      search: searchTerm.trim() || undefined,
      tag: tag === 'All' ? undefined : tag,
    });
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    startTransition(() => {
      loadProjects(val, selectedTag);
    });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    loadProjects(search, tag);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-20 antialiased`}>
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#fafafa] mb-4">
              Abandoned projects.
              <br />
              <span className="text-[#8a8a8a]">Free for the taking.</span>
            </h1>

            <p className="text-base text-[#8a8a8a] leading-relaxed max-w-2xl">
              Browse half-built side projects that never shipped, and scavenge the modules, parsers,
              shaders, and configs that still work.
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c5c5c]" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by title, tag, or file name..."
                className={`w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3.5 py-2.5 pl-10 text-sm text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`}
              />
            </div>

            <div className="flex items-center gap-2">
            <TagFilter tags={TAG_FILTERS} selected={selectedTag} onSelect={handleTagClick} />

            <button
              type="button"
              onClick={() => loadProjects(search, selectedTag)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-transparent hover:bg-[#141414] text-[#fafafa] text-sm font-medium rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors active:scale-[0.98] ${focusRing}`}
              title="Refresh feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            </div>
          </div>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa]">Catalog</h2>
          <span className="text-xs text-[#8a8a8a]">
            {loading ? 'Loading...' : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden shadow-[inset_0_0_0_1px_#2a2a2a] animate-pulse"
              >
                <div className="aspect-video bg-[#141414]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[#141414] rounded w-1/3" />
                  <div className="h-5 bg-[#1e1e1e] rounded w-3/4" />
                  <div className="h-3 bg-[#141414] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2a2a2a] rounded-xl my-6">
            <Search className="w-8 h-8 mx-auto text-[#3a3a3a] mb-3" />
            <h3 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa] mb-1">
              No projects found
            </h3>
            <p className="text-sm text-[#8a8a8a] max-w-sm mx-auto mb-5">
              Nothing matched your search or tag. Try a different term or clear the filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedTag('All');
                loadProjects('', 'All');
              }}
              className={`px-4 py-2 text-sm font-medium bg-[#fafafa] hover:bg-white text-[#080808] rounded-lg transition-[background-color,transform] active:scale-[0.98] ${focusRing}`}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}