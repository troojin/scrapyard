'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createProjectRecord } from '@/lib/projectsApi';
import { AuthModal } from '@/components/AuthModal';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  GitBranch,
  Code2,
  Skull,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  const router = useRouter();
  const { user, loginAsDemoUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [reasonAbandoned, setReasonAbandoned] = useState('');
  const [salvageableCode, setSalvageableCode] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshotPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setError(null);

    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    if (!githubUrl.trim().startsWith('http')) {
      setError('Please provide a valid GitHub repository URL starting with https://');
      return;
    }

    if (!reasonAbandoned.trim()) {
      setError('Please describe why the project stopped / cause of death');
      return;
    }

    if (!salvageableCode.trim()) {
      setError('Please highlight what specific code/file is worth salvaging');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);

    const res = await createProjectRecord(
      {
        title: title.trim(),
        github_url: githubUrl.trim(),
        screenshot: screenshotFile,
        reason_abandoned: reasonAbandoned.trim(),
        salvageable_code: salvageableCode.trim(),
        tags,
      },
      user
    );

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError(res.error || 'Failed to submit project');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-16">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="w-12 h-12 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">
            Authentication Required
          </h1>
          <p className="text-xs text-zinc-400 font-sans mb-6 leading-relaxed">
            Only registered developers can deposit abandoned projects into the Scrapyard. Sign in or
            create a profile with your avatar to proceed.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-mono font-bold rounded transition-colors"
            >
              Sign In or Register
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoUser()}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded border border-zinc-700 transition-colors"
            >
              Quick Test: Sign in as Demo User
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 pt-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Scrapyard Catalog</span>
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 transition-colors"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Dump an Abandoned Project
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-sans">
            Document what you built, why you walked away, and guide other developers to the code
            worth reusing.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {error && (
          <div className="mb-6 p-4 rounded bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>Project successfully submitted to the Scrapyard! Redirecting to feed...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${showPreview ? 'lg:col-span-7' : 'lg:col-span-12 max-w-2xl'}`}
          >
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 uppercase tracking-wide">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GraphVector, SQLite Sync Engine, WebGL Shader Toy"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                <span>GitHub Repository URL</span> <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/abandoned-repo"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 uppercase tracking-wide">
                Project Screenshot / Architecture Diagram
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {screenshotPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video group">
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="p-1.5 bg-zinc-900/90 hover:bg-red-900/90 text-zinc-300 hover:text-white rounded border border-zinc-700 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 rounded-lg p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-300 block mb-1">
                    Click to upload screenshot or UI preview
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 block">
                    PNG, JPG, WebP up to 5MB
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-red-400" />
                <span>Why Did You Abandon It? (Cause of Death)</span> <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reasonAbandoned}
                onChange={(e) => setReasonAbandoned(e.target.value)}
                placeholder="Be brutally honest: Did competitors ship first? Did AWS bills explode? Did Chrome MV3 break your background workers? Real postmortems help everyone."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>What Code/File Is Worth Salvaging?</span> <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={salvageableCode}
                onChange={(e) => setSalvageableCode(e.target.value)}
                placeholder="Give exact file paths and functions. e.g. 'crates/simd/distance.rs has a standalone zero-allocation cosine distance routine that compiles without external dependencies.'"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 uppercase tracking-wide">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="TypeScript, SQLite, WebGL, Algorithms, Parser"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-mono font-bold text-sm rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publish Project to Scrapyard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {showPreview && (
            <div className="lg:col-span-5 sticky top-24 self-start">
              <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
                <span className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
                  Live Card Preview
                </span>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-zinc-950 relative">
                    {screenshotPreview ? (
                      <img
                        src={screenshotPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                        No screenshot
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400">{user.username}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-zinc-800 rounded text-zinc-300">
                        GitHub
                      </span>
                    </div>
                    <h3 className="font-bold text-zinc-100 text-sm">
                      {title || 'Untitled Project'}
                    </h3>
                    <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-xs">
                      <span className="text-red-400 font-mono text-[10px] block mb-0.5">
                        Cause of death:
                      </span>
                      <p className="text-zinc-400 line-clamp-2">
                        {reasonAbandoned || 'Why this project was abandoned...'}
                      </p>
                    </div>
                    <div className="p-2 bg-zinc-950 rounded border border-amber-500/20 text-xs font-mono">
                      <span className="text-amber-400 text-[10px] block mb-0.5">
                        Salvageable code:
                      </span>
                      <p className="text-zinc-300 line-clamp-2 text-[11px]">
                        {salvageableCode || 'Which file or routine is golden...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
