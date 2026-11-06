'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFeedFilter, TAG_FILTERS } from '@/context/FeedFilterContext';
import { AuthModal } from './AuthModal';
import { TagFilter } from '@/components/TagFilter';
import { getAvatarUrl } from '@/lib/pocketbase';
import { fetchProjects } from '@/lib/projectsApi';
import type { Project } from '@/types';
import { Inter } from 'next/font/google';
import { Plus, User, LogOut, ChevronDown, Search, ShoppingBag } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

const menuItemCls = `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#b8b8b8] hover:bg-[#141414] hover:text-[#fafafa] transition-colors text-left ${focusRing}`;

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const {
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    docked,
  } = useFeedFilter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState<Project[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const avatarUrl = user ? getAvatarUrl(user) : '';
  const showDockedControls = pathname === '/' && docked;

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    let cancelled = false;
    setResultsLoading(true);
    const t = setTimeout(async () => {
      const minNum = minPrice.trim() ? parseFloat(minPrice) : undefined;
      const maxNum = maxPrice.trim() ? parseFloat(maxPrice) : undefined;

      const data = await fetchProjects({
        search: search.trim() || undefined,
        tag: selectedTag === 'All' ? undefined : selectedTag,
        minPrice: isNaN(minNum as number) ? undefined : minNum,
        maxPrice: isNaN(maxNum as number) ? undefined : maxNum,
      });
      if (!cancelled) {
        setResults(data.slice(0, 6));
        setResultsLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, selectedTag, minPrice, maxPrice, isSearchOpen]);

  useEffect(() => {
    if (!showDockedControls) setIsSearchOpen(false);
  }, [showDockedControls]);

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-md transition-opacity duration-300 ease-out ${
          isSearchOpen && showDockedControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <header
        className={`${inter.className} sticky top-0 z-40 w-full bg-[#080808]/90 border-b border-[#1a1a1a] backdrop-blur-md antialiased`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.025em] text-[#fafafa] hover:text-[#b8b8b8] transition-colors shrink-0 justify-self-start"
          >
            Scrapyard
          </Link>

          <div
            ref={searchWrapRef}
            aria-hidden={!showDockedControls}
            className={`relative hidden md:block md:w-[28rem] lg:w-[40rem] transition-all duration-300 ease-out ${
              showDockedControls
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-3 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5c5c]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  tabIndex={showDockedControls ? 0 : -1}
                  placeholder="Search by title, tag, or file name..."
                  className={`w-full h-10 bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3 pl-9 text-[13px] text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`}
                />
              </div>
              <TagFilter
                tags={TAG_FILTERS}
                selected={selectedTag}
                onSelect={setSelectedTag}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={handlePriceChange}
                align="right"
                triggerClassName="h-10 shrink-0"
              />
            </div>

            <div
              className={`absolute left-0 right-0 top-full mt-2 origin-top bg-[#080808] rounded-xl p-1.5 z-50 shadow-[inset_0_0_0_1px_#2a2a2a,0_24px_60px_rgba(0,0,0,0.7)] transition-all duration-200 ease-out ${
                isSearchOpen && showDockedControls
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#5c5c5c] uppercase tracking-[0.05em]">
                  {search.trim() ? 'Results' : 'Latest projects'}
                </span>
                <span className="text-[11px] text-[#5c5c5c]">
                  {resultsLoading ? 'Searching...' : `${results.length} shown`}
                </span>
              </div>

              {results.length === 0 && !resultsLoading ? (
                <div className="px-3 py-6 text-center text-sm text-[#8a8a8a]">
                  Nothing matched. Try a different term or tag.
                </div>
              ) : (
                <ul>
                  {results.map((project) => (
                    <li key={project.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch(project.title);
                          setIsSearchOpen(false);
                        }}
                        className={menuItemCls}
                      >
                        <Search className="w-3.5 h-3.5 text-[#5c5c5c] shrink-0" />
                        <span className="truncate">{project.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-self-end">
            <Link
              href="/submit"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-[background-color,transform,border-color] duration-150 active:scale-[0.98] ${focusRing} ${
                pathname === '/submit'
                  ? 'bg-[#141414] text-[#fafafa] border border-[#3a3a3a]'
                  : 'bg-[#fafafa] hover:bg-white text-[#080808] border border-transparent'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dump a Project</span>
              <span className="sm:hidden">Dump</span>
            </Link>

            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Account menu"
                  className={`flex items-center gap-1 p-1 pr-1.5 rounded-full hover:bg-[#141414] transition-colors ${focusRing}`}
                >
                  <span className="w-8 h-8 rounded-full overflow-hidden bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#8a8a8a]" />
                    )}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8a8a8a] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-[#0c0c0c] rounded-xl p-1.5 z-50 shadow-[inset_0_0_0_1px_#2a2a2a,0_16px_40px_rgba(0,0,0,0.6)] animate-dropdown will-change-transform"
                  >
                    <div className="px-3 py-2.5">
                      <span className="block text-sm font-medium text-[#fafafa] truncate">
                        {user.username}
                      </span>
                    </div>

                    <div className="my-1 h-px bg-[#1a1a1a]" />

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={menuItemCls}
                    >
                      <User className="w-4 h-4 text-[#8a8a8a]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/purchases"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={menuItemCls}
                    >
                      <ShoppingBag className="w-4 h-4 text-[#8a8a8a]" />
                      <span>Purchases</span>
                    </Link>

                    <div className="my-1 h-px bg-[#1a1a1a]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className={menuItemCls}
                    >
                      <LogOut className="w-4 h-4 text-[#8a8a8a]" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className={`px-3 py-2 text-[13px] font-medium text-[#fafafa] bg-transparent hover:bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ${focusRing}`}
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}