'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { getAvatarUrl } from '@/lib/pocketbase';
import { Inter } from 'next/font/google';
import { Plus, User, LogOut, ChevronDown } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user ? getAvatarUrl(user) : '';

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

  const menuItemCls = `w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#b8b8b8] hover:bg-[#141414] hover:text-[#fafafa] transition-colors text-left ${focusRing}`;

  return (
    <>
      <header
        className={`${inter.className} sticky top-0 z-40 w-full bg-[#080808]/90 border-b border-[#1a1a1a] backdrop-blur-md antialiased`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.025em] text-[#fafafa] hover:text-[#b8b8b8] transition-colors"
          >
            Scrapyard
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 bg-transparent hover:bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg transition-colors text-[13px] text-[#fafafa] ${focusRing}`}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] shrink-0 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#8a8a8a]" />
                    )}
                  </div>
                  <span className="font-medium max-w-[100px] truncate">{user.username}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8a8a8a] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-52 bg-[#080808] rounded-xl p-1.5 z-50 shadow-[inset_0_0_0_1px_#2a2a2a,0_16px_40px_rgba(0,0,0,0.6)] animate-dropdown will-change-transform"
                  >
                    <div className="px-3 py-2 mb-1">
                      <span className="block text-[11px] font-medium text-[#5c5c5c] uppercase tracking-[0.05em]">
                        Signed in as
                      </span>
                      <span className="text-sm font-semibold text-[#fafafa] truncate block mt-0.5">
                        {user.username}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`${menuItemCls} rounded-lg`}
                    >
                      <User className="w-4 h-4 text-[#8a8a8a]" />
                      <span>Profile & Projects</span>
                    </Link>

                    <Link
                      href="/submit"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`${menuItemCls} rounded-lg`}
                    >
                      <Plus className="w-4 h-4 text-[#8a8a8a]" />
                      <span>Submit Project</span>
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#ef4444] hover:bg-[#141414] hover:text-[#fca5a5] transition-colors text-left rounded-lg mt-1 ${focusRing}`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
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