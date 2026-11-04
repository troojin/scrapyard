'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Wrench, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemoUser } = useAuth();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(identity, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleDemo = () => {
    loginAsDemoUser();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-mono font-bold tracking-wider text-zinc-100 text-lg">
              SCRAPYARD
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Sign in to your account</h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Or{' '}
            <Link href="/signup" className="text-amber-500 hover:underline">
              register a new scavenger profile
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
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase tracking-wide">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="dev@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-2 px-3 text-xs font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 rounded border border-zinc-700 transition-colors"
            >
              1-Click Demo Login (scavenger_core)
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
