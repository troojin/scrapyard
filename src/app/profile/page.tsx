'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProjects, deleteProjectRecord } from '@/lib/projectsApi';
import { getAvatarUrl } from '@/lib/pocketbase';
import { ProjectCard } from '@/components/ProjectCard';
import { AuthModal } from '@/components/AuthModal';
import type { Project } from '@/types';
import {
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowLeft,
  Mail,
  Calendar,
  Layers,
  Settings,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateAvatar, updateProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

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
      setStatusMessage({ text: 'Profile picture updated successfully.' });
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
      setStatusMessage({ text: 'Profile updated successfully.' });
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-16">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="w-12 h-12 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">
            Profile Access
          </h1>
          <p className="text-xs text-zinc-400 font-sans mb-6 leading-relaxed">
            Please log in to manage your profile and view your dumped side projects.
          </p>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-mono font-bold rounded transition-colors"
          >
            Sign In or Register
          </button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="login"
        />
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(user, '200x200');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
                Developer Profile
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
                Manage your credentials, avatar, and cataloged graveyard projects.
              </p>
            </div>

            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-mono font-bold rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Dump New Project</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded text-xs flex items-start gap-2.5 border ${
              statusMessage.isError
                ? 'bg-red-950/60 border-red-800/80 text-red-200'
                : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 mb-4 group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-mono"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Change</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarFile}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs font-mono text-amber-500 hover:text-amber-400 mb-4 transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingAvatar ? 'Uploading avatar...' : 'Upload new avatar'}</span>
                </button>

                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{user.username}</h2>
                {user.email && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.created && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono mt-1">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    <span>Member since {new Date(user.created).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 uppercase tracking-wider mb-4">
                  <Settings className="w-3.5 h-3.5 text-amber-500" />
                  <span>Account Details</span>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional real name"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 font-sans focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded border border-zinc-700 transition-colors"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-6">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
                  My Dumped Projects
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {loadingProjects ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
                Loading your projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-10 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-lg">
                <p className="text-xs font-mono text-zinc-400 mb-2">
                  You haven&apos;t cataloged any abandoned projects yet.
                </p>
                <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto font-sans">
                  Have a repo rotting on your hard drive? Dump it here so other developers can reuse
                  the good parts.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-mono font-bold rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dump Your First Project</span>
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
