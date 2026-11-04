'use client';

import React, { useState } from 'react';
import type { Project } from '@/types';
import { getFileUrl, getAvatarUrl } from '@/lib/pocketbase';
import { X, ExternalLink, Copy, Check, Skull, Code2, Calendar, User, FileCode } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const screenshotUrl = project.screenshot
    ? getFileUrl(project, project.screenshot)
    : '';

  const author = project.expand?.user;
  const authorAvatar = getAvatarUrl(author);
  const authorName = author?.username || 'anonymous_dev';

  const copySalvageCode = () => {
    navigator.clipboard.writeText(project.salvageable_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = project.created
    ? new Date(project.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown date';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-6 text-zinc-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 m-2 text-zinc-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-mono text-zinc-400">
              Scrapped by <span className="text-zinc-200 font-semibold">{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            {project.title}
          </h2>
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono rounded border border-zinc-700 transition-colors shrink-0 w-fit"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {screenshotUrl && (
          <div className="mb-6 rounded-md overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video relative">
            <img
              src={screenshotUrl}
              alt={`${project.title} screenshot`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded bg-red-950/20 border border-red-900/40">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-red-400 mb-2">
              <Skull className="w-4 h-4 shrink-0" />
              <span>Cause of Death / Why It Stopped</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              {project.reason_abandoned}
            </p>
          </div>

          <div className="p-4 rounded bg-zinc-950 border border-amber-500/30">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                <Code2 className="w-4 h-4 shrink-0" />
                <span>Salvagable Code & Useful Parts</span>
              </div>
              <button
                type="button"
                onClick={copySalvageCode}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-amber-200/90 whitespace-pre-wrap bg-zinc-900/70 p-3 rounded border border-zinc-800 leading-relaxed">
              {project.salvageable_code}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs font-mono">
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Scavenge repo files on GitHub &rarr;</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
