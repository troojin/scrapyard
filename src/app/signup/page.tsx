'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Wrench, AlertCircle, ArrowLeft, ArrowRight, Upload, User } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginAsDemoUser } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    const res = await signup({
      username,
      email,
      password,
      passwordConfirm,
      avatar: avatarFile,
    });

    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-mono font-bold tracking-wider text-zinc-100 text-lg">
              SCRAPYARD
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Create a developer profile</h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Already registered?{' '}
            <Link href="/login" className="text-amber-500 hover:underline">
              Sign in to your account
            </Link>
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-zinc-950/70 border border-zinc-800 rounded">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-zinc-500" />
                )}
              </div>
              <div className="flex-1">
                <span className="block text-xs font-mono text-zinc-300 uppercase tracking-wide mb-1">
                  Profile Picture
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatar}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="rustacean_99"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Confirm
                </label>
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repeat"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-mono font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => {
                loginAsDemoUser();
                router.push('/');
              }}
              className="w-full py-2 px-3 text-xs font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 rounded border border-zinc-700 transition-colors"
            >
              1-Click Demo Login
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
