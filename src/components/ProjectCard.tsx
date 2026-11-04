'use client';

import React, { useState } from 'react';
import type { Project } from '@/types';
import { getFileUrl, getAvatarUrl } from '@/lib/pocketbase';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ExternalLink, Skull, Code2, Copy, Check, Terminal, Maximize2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
  canManage?: boolean;
}

export function ProjectCard({ project, onDelete, canManage }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const screenshotUrl = project.screenshot
    ? getFileUrl(project, project.screenshot, '600x400')
    : '';

  const author = project.expand?.user;
  const authorAvatar = getAvatarUrl(author);
  const authorName = author?.username || 'developer';

  const copySalvageCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(project.salvageable_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = project.created
    ? new Date(project.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <>
      <article className="group bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-150">
        <div>
          <div
            onClick={() => setIsModalOpen(true)}
            className="relative aspect-video w-full bg-zinc-950 overflow-hidden cursor-pointer border-b border-zinc-800/80"
          >
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt={`${project.title} screenshot`}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-600 bg-zinc-950">
                <Terminal className="w-8 h-8 mb-2 text-zinc-700" />
                <span className="text-xs font-mono text-zinc-500">No screenshot provided</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/90 text-zinc-200 text-xs font-mono rounded border border-zinc-700">
                <Maximize2 className="w-3.5 h-3.5" />
                Inspect Scrap
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-700" />
                  )}
                </div>
                <span className="text-xs font-mono text-zinc-400 truncate">
                  {authorName}
                </span>
                {formattedDate && (
                  <span className="text-[10px] font-mono text-zinc-600">
                    • {formattedDate}
                  </span>
                )}
              </div>

              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors shrink-0"
                title="View GitHub Repository"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            </div>

            <h3
              onClick={() => setIsModalOpen(true)}
              className="text-base font-bold text-zinc-100 hover:text-amber-400 cursor-pointer transition-colors mb-3 tracking-tight"
            >
              {project.title}
            </h3>

            <div className="space-y-2.5 mb-4">
              <div className="p-2.5 rounded bg-zinc-950/70 border border-zinc-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-red-400/90 mb-1">
                  <Skull className="w-3.5 h-3.5 shrink-0" />
                  <span>Why It Died</span>
                </div>
                <p className="text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                  {project.reason_abandoned}
                </p>
              </div>

              <div className="p-2.5 rounded bg-zinc-950 border border-amber-500/20 text-xs">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-400">
                    <Code2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Salvageable Code</span>
                  </div>
                  <button
                    type="button"
                    onClick={copySalvageCode}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                    title="Copy reusable code path"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="font-mono text-zinc-300 line-clamp-2 leading-relaxed text-[11px]">
                  {project.salvageable_code}
                </p>
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-500 border border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="text-[10px] font-mono text-zinc-600 self-center">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-zinc-950/50 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-amber-500 hover:text-amber-400 transition-colors text-[11px] inline-flex items-center gap-1"
          >
            <span>Read full postmortem</span>
            <span>&rarr;</span>
          </button>

          {canManage && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(project.id)}
              className="text-red-400 hover:text-red-300 transition-colors text-[11px]"
            >
              Delete
            </button>
          )}
        </div>
      </article>

      <ProjectDetailModal
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
