'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { Wrench, AlertCircle, ArrowRight, Mail, Check } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export default function LoginPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // TODO: point this at your real email sign-in endpoint (magic link / one-time code).
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Could not continue with that email');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // TODO: wire these to your OAuth routes / auth provider.
  const handleOAuth = (provider: 'google' | 'github') => {
    window.location.href = `/api/auth/${provider}`;
  };

  const outlineBtn = `w-full py-2.5 px-4 text-sm font-medium text-[#fafafa] bg-transparent hover:bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2.5 ${focusRing}`;
  const primaryBtn = `group w-full py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:active:scale-100 ${focusRing}`;

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] flex items-center justify-center px-4 py-12 antialiased`}>
      <div className="w-full max-w-md bg-[#080808] rounded-xl p-8 shadow-[inset_0_0_0_1px_#2a2a2a]">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] flex items-center justify-center text-[#fafafa]">
            <Wrench className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#fafafa]">
            Sign in to your account
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.35)] text-[#fca5a5] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px text-[#ef4444]" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {sent ? (
            <div className="p-3 rounded-lg shadow-[inset_0_0_0_1px_#2a2a2a] text-sm text-[#b8b8b8] flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#fafafa]" />
              <span>Check {email} for your sign-in link.</span>
            </div>
          ) : showEmail ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                required
                autoFocus
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`}
              />
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setShowEmail(true)} className={primaryBtn}>
              <Mail className="w-4 h-4" />
              <span>Continue with email</span>
            </button>
          )}

          <button type="button" onClick={() => handleOAuth('google')} className={outlineBtn}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
          <button type="button" onClick={() => handleOAuth('github')} className={outlineBtn}>
            <GitHubIcon />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}