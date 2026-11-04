'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { getAvatarUrl } from '@/lib/pocketbase';
import { Wrench, Plus, User, LogOut, Database, ChevronDown } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isConnected } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const avatarUrl = user ? getAvatarUrl(user) : '';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold tracking-wider text-zinc-100 text-base leading-none">
                  SCRAPYARD
                </span>
                <span className="text-[10px] font-mono text-zinc-400 leading-none mt-1">
                  salvage the dead code
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800">
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${
                  isConnected
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
                title={
                  isConnected
                    ? `Connected to PocketBase at ${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8090'}`
                    : `PocketBase standby (${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8090'})`
                }
              >
                <Database className="w-3 h-3" />
                <span>{isConnected ? 'PocketBase Live' : 'PocketBase Standby'}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                pathname === '/submit'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-amber-600/15 hover:bg-amber-600/25 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dump a Project</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded transition-colors text-xs text-zinc-200"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 m-1 text-zinc-400" />
                    )}
                  </div>
                  <span className="font-mono font-medium max-w-[100px] truncate">{user.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isUserMenuOpen && (
                  <div
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-1 z-50 text-xs font-mono"
                  >
                    <div className="px-3 py-2 border-b border-zinc-800 text-zinc-400">
                      <span className="block text-[10px] text-zinc-500 uppercase">Signed in as</span>
                      <span className="text-zinc-200 font-bold truncate block">{user.username}</span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Profile & Projects</span>
                    </Link>

                    <Link
                      href="/submit"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-500" />
                      <span>Submit Project</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-zinc-800/80 transition-colors border-t border-zinc-800 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="px-3 py-1.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
