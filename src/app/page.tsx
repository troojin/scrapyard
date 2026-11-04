'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { fetchProjects } from '@/lib/projectsApi';
import { ProjectCard } from '@/components/ProjectCard';
import type { Project } from '@/types';
import { Search, Terminal, Filter, RefreshCw, Layers } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <section className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Postmortem Archive</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-100 mb-3">
              Abandoned projects. <br />
              <span className="text-amber-500">Free for the taking.</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans max-w-2xl">
              Browse half-built side projects that never shipped. Read why the creator stopped building,
              and scavenge the tested modules, parsers, shaders, and configs that still work.
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Filter by title, cause of death, or file name (e.g. SIMD, OAuth, worker)..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 pl-9 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadProjects(search, selectedTag)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono rounded border border-zinc-800 transition-colors"
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="text-zinc-500 text-[11px] uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Tag:
            </span>
            {TAG_FILTERS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-zinc-200 text-zinc-950 font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Scavenge Catalog
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {loading ? 'Searching archive...' : `${projects.length} scraps cataloged`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-zinc-800/50" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-800/80 rounded w-1/3" />
                  <div className="h-6 bg-zinc-800 rounded w-3/4" />
                  <div className="h-16 bg-zinc-800/60 rounded" />
                  <div className="h-14 bg-zinc-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg my-6">
            <Terminal className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
            <h3 className="text-sm font-mono font-bold text-zinc-300 mb-1">
              No matching scrap projects found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4 font-sans">
              No abandoned repositories matched your current query or tag. Try adjusting your search term
              or clear the filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedTag('All');
                loadProjects('', 'All');
              }}
              className="px-3 py-1.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors"
            >
              Reset Filters
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
