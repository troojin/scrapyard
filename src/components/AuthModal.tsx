'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Upload, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, signup, loginAsDemoUser, isConnected } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [identity, setIdentity] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(identity, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication failed');
      }
    } else {
      if (password !== passwordConfirm) {
        setError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsSubmitting(false);
        return;
      }

      const res = await signup({
        username,
        email,
        password,
        passwordConfirm,
        avatar: avatarFile,
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Account creation failed');
      }
    }
    setIsSubmitting(false);
  };

  const handleDemoSignIn = () => {
    loginAsDemoUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-6 text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Identity Verification
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            {mode === 'login' ? 'Sign in to Scrapyard' : 'Register as a Scavenger'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Access your submitted scraps and manage your developer profile.'
              : 'Join to catalog abandoned projects and salvage code snippets.'}
          </p>
        </div>

        <div className="flex border-b border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`pb-2.5 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 mr-6 ${
              mode === 'login'
                ? 'border-amber-500 text-amber-500 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`pb-2.5 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-amber-500 text-amber-500 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            <>
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="alex_dev or alex@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 p-3 bg-zinc-950/70 border border-zinc-800 rounded">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-zinc-500" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-mono text-zinc-300 uppercase tracking-wide mb-1">
                    Profile Picture
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rust_enthusiast"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scavenger@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1 uppercase tracking-wide">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repeat"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold py-2.5 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Authenticate' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 mb-2">Want to test the app without setting up PocketBase?</p>
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 px-3 text-xs font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 hover:text-amber-400 rounded border border-zinc-700 transition-colors"
          >
            One-Click Demo Login (scavenger_core)
          </button>
          {!isConnected && (
            <p className="text-[11px] text-amber-500/80 font-mono mt-2">
              PocketBase not detected on {process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8090'}. Demo mode is active.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
