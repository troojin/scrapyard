'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProjects, deleteProjectRecord } from '@/lib/projectsApi';
import { getAvatarUrl } from '@/lib/pocketbase';
import { ProjectCard } from '@/components/ProjectCard';
import { AuthModal } from '@/components/AuthModal';
import type { Project } from '@/types';
import { Inter } from 'next/font/google';
import {
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowLeft,
  Mail,
  Calendar,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';
const labelCls = 'block text-[11px] font-medium text-[#8a8a8a] mb-2 uppercase tracking-[0.05em]';
const fieldCls = `w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]`;
const primaryBtn = `group inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 ${focusRing}`;

export default function ProfilePage() {
  const { user, updateAvatar, updateProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleStripeConnect = async () => {
    if (!user) return;
    setIsConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
    } finally {
      setIsConnectingStripe(false);
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setName(user.name || '');
      loadMyProjects(user.id);
    } else {
      setLoadingProjects(false);
    }
  }, [user]);

  const loadMyProjects = async (userId: string) => {
    setLoadingProjects(true);
    const data = await fetchUserProjects(userId);
    setProjects(data);
    setLoadingProjects(false);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setStatusMessage({ text: 'Avatar file must be under 3MB', isError: true });
      return;
    }

    setIsUploadingAvatar(true);
    setStatusMessage(null);
    const res = await updateAvatar(file);
    setIsUploadingAvatar(false);

    if (res.success) {
      setStatusMessage({ text: 'Profile picture updated.' });
    } else {
      setStatusMessage({ text: res.error || 'Failed to upload avatar', isError: true });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    setStatusMessage(null);

    const res = await updateProfile({ username, name });
    setIsUpdatingProfile(false);

    if (res.success) {
      setStatusMessage({ text: 'Profile updated.' });
    } else {
      setStatusMessage({ text: res.error || 'Failed to update profile', isError: true });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project from the Scrapyard?')) {
      return;
    }

    const res = await deleteProjectRecord(id);
    if (res.success && user) {
      loadMyProjects(user.id);
    } else {
      alert(res.error || 'Failed to delete project');
    }
  };

  if (!user) {
    return (
      <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] flex items-center justify-center px-4 py-16 antialiased`}>
        <div className="w-full max-w-md bg-[#080808] rounded-xl p-8 text-center shadow-[inset_0_0_0_1px_#2a2a2a]">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#fafafa] mb-2">
            Sign in to view your profile
          </h1>
          <p className="text-sm text-[#8a8a8a] mb-6 leading-relaxed">
            Log in to manage your profile and see the projects you’ve dumped.
          </p>

          <div className="space-y-4">
            <button type="button" onClick={() => setIsAuthModalOpen(true)} className={`${primaryBtn} w-full`}>
              Sign In
            </button>
            <p className="text-sm text-[#8a8a8a]">
              Don’t have an account?{' '}
              <Link href="/register" className="text-[#fafafa] hover:underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(user, '200x200');

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-20 antialiased`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to catalog</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#fafafa]">Your profile</h1>
            <p className="text-sm text-[#8a8a8a] mt-2">
              Manage your account details, avatar, and the projects you’ve shared.
            </p>
          </div>

          <Link href="/submit" className={primaryBtn}>
            <Plus className="w-4 h-4" />
            <span>Dump a project</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {statusMessage && (
          <div
            role="status"
            className={`mb-6 p-4 rounded-lg text-xs flex items-start gap-2.5 ${
              statusMessage.isError
                ? 'bg-[#ef4444]/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.35)] text-[#fca5a5]'
                : 'bg-[#22c55e]/10 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.35)] text-[#86efac]'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-px text-[#ef4444]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-px text-[#22c55e]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="rounded-xl p-6 shadow-[inset_0_0_0_1px_#2a2a2a]">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] mb-4 group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5c5c5c]">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    aria-label="Change profile picture"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#fafafa] text-[11px] font-medium focus:outline-none"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Change</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarFile}
                  className="hidden"
                />

                <h2 className="text-lg font-semibold tracking-[-0.01em] text-[#fafafa]">{user.username}</h2>
                {user.email && (
                  <div className="flex items-center gap-1.5 text-sm text-[#8a8a8a] mt-1 min-w-0 max-w-full">
                    <Mail className="w-3.5 h-3.5 text-[#5c5c5c] shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {user.created && (
                  <div className="flex items-center gap-1.5 text-xs text-[#5c5c5c] mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Member since{' '}
                      {new Date(user.created).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#fafafa] mb-4">
                  Account details
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="profile-username" className={labelCls}>Username</label>
                    <input
                      id="profile-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={fieldCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-name" className={labelCls}>Display name</label>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional real name"
                      className={fieldCls}
                    />
                  </div>

                  <button type="submit" disabled={isUpdatingProfile} className={`${primaryBtn} w-full`}>
                    {isUpdatingProfile ? (
                      <span className="inline-block w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save changes</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-[#1a1a1a] space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#fafafa] mb-1">
                      Seller Payouts
                    </h3>
                    <p className="text-xs text-[#8a8a8a] mb-3">
                      Connect your Stripe account to receive 90% direct payouts when buyers purchase your projects.
                    </p>

                    {user.stripe_onboarded ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/25 text-xs text-[#22c55e]">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Stripe Connect Active (Payouts Ready)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStripeConnect}
                        disabled={isConnectingStripe}
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#141414] hover:bg-[#1a1a1a] text-[#fafafa] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 text-[#8a8a8a]" />
                        <span>{isConnectingStripe ? 'Connecting...' : 'Connect Stripe Payouts'}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/purchases"
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-transparent hover:bg-[#141414] text-[#fafafa] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#8a8a8a]" />
                      <span>View Purchased Codebases</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa]">Your projects</h2>
              <span className="text-xs text-[#8a8a8a]">
                {loadingProjects
                  ? 'Loading...'
                  : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
              </span>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((idx) => (
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
              <div className="p-10 text-center border border-dashed border-[#2a2a2a] rounded-xl">
                <h3 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa] mb-1">
                  No projects yet
                </h3>
                <p className="text-sm text-[#8a8a8a] mb-5 max-w-sm mx-auto">
                  Have a repo sitting on your hard drive? Dump it here so other developers can reuse the
                  good parts.
                </p>
                <Link href="/submit" className={primaryBtn}>
                  <Plus className="w-4 h-4" />
                  <span>Dump your first project</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    canManage={true}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}