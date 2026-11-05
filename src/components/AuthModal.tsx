'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Inter } from 'next/font/google';
import { X, Upload, User, AlertCircle, ArrowRight } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const focusRing = 'focus:outline-none focus:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';
const labelCls = 'block text-[11px] font-medium text-[#8a8a8a] mb-2 uppercase tracking-[0.05em]';
const inputCls = `w-full bg-transparent border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-[#fafafa] placeholder:text-[#5c5c5c] transition-[border-color,box-shadow] duration-150 ${focusRing}`;

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

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, signup } = useAuth();
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
  const [step, setStep] = useState<1 | 2>(1);

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

    if (mode === 'login') {
      setIsSubmitting(true);
      const res = await login(identity, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication failed');
      }
      setIsSubmitting(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setStep(2);
  };

  const finishSignup = async (skip = false) => {
    setError(null);
    setIsSubmitting(true);

    const res = await signup({
      username,
      email,
      password,
      passwordConfirm,
      avatar: skip ? null : avatarFile,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Account creation failed');
      setStep(1);
    }
    setIsSubmitting(false);
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    window.location.href = `/api/auth/${provider}`;
  };

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError(null);
    setStep(1);
  };

  const tabCls = (active: boolean) =>
    `py-2 text-[13px] font-medium rounded-md transition-colors ${focusRing} ${
      active ? 'bg-[#141414] text-[#fafafa] shadow-[inset_0_0_0_1px_#2a2a2a]' : 'text-[#8a8a8a] hover:text-[#fafafa]'
    }`;

  const outlineBtn = `w-full py-2.5 px-4 text-sm font-medium text-[#fafafa] bg-transparent hover:bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2.5 ${focusRing}`;

  return (
    <div className={`${inter.className} fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs antialiased animate-backdrop`}>
      <div className="relative w-full max-w-md bg-[#080808] rounded-xl p-8 shadow-[inset_0_0_0_1px_#2a2a2a] text-[#fafafa] max-h-[calc(100vh-2rem)] overflow-y-auto animate-modal will-change-transform">
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-[#8a8a8a] hover:text-[#fafafa] p-1 rounded-md transition-colors ${focusRing}`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-center mb-6">
          {mode === 'login' ? 'Sign in to your account' : step === 1 ? 'Create your account' : 'Add a profile picture'}
        </h2>
        {mode === 'signup' && step === 2 && (
          <p className="text-sm text-[#8a8a8a] text-center -mt-4 mb-6">Help people recognize you. You can always add one later.</p>
        )}

        {step === 1 && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-[#2a2a2a] mb-5">
          <button type="button" onClick={() => switchMode('login')} className={tabCls(mode === 'login')}>
            Sign In
          </button>
          <button type="button" onClick={() => switchMode('signup')} className={tabCls(mode === 'signup')}>
            New Account
          </button>
        </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.35)] text-[#fca5a5] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px text-[#ef4444]" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
        <>
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'login' ? (
            <>
              <div>
                <label htmlFor="modal-identity" className={labelCls}>Email or Username</label>
                <input
                  id="modal-identity"
                  type="text"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="alex_dev or alex@example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="modal-password" className={labelCls}>Password</label>
                <input
                  id="modal-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="modal-username" className={labelCls}>Username</label>
                <input
                  id="modal-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rust_enthusiast"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="modal-email" className={labelCls}>Email</label>
                <input
                  id="modal-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scavenger@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="modal-new-password" className={labelCls}>Password</label>
                <input
                  id="modal-new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="modal-confirm" className={labelCls}>Confirm Password</label>
                <input
                  id="modal-confirm"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className={inputCls}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`group w-full py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100 ${focusRing}`}
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-3 space-y-3">
          <button type="button" onClick={() => handleOAuth('google')} className={outlineBtn}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
          <button type="button" onClick={() => handleOAuth('github')} className={outlineBtn}>
            <GitHubIcon />
            <span>Continue with GitHub</span>
          </button>
        </div>
        </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#141414] shadow-[inset_0_0_0_1px_#2a2a2a] flex items-center justify-center mb-6">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#5c5c5c]" />
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            {avatarPreview ? (
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={() => finishSignup(false)}
                  disabled={isSubmitting}
                  className={`group w-full py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100 ${focusRing}`}
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Finish</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className={outlineBtn}
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose a different photo</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 bg-[#fafafa] hover:bg-white text-[#080808] font-medium text-sm rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-60 ${focusRing}`}
              >
                <Upload className="w-4 h-4" />
                <span>Choose photo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => finishSignup(true)}
              disabled={isSubmitting}
              className="mt-6 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors disabled:opacity-60"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}