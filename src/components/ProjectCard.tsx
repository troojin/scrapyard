'use client';

import React, { useState } from 'react';
import type { Project } from '@/types';
import { getFileUrl, getAvatarUrl } from '@/lib/pocketbase';
import { ProjectDetailModal } from './ProjectDetailModal';
import { Image as ImageIcon, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
  canManage?: boolean;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa]/30';

export function ProjectCard({ project, onDelete, canManage }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const screenshotUrl = project.screenshot
    ? getFileUrl(project, project.screenshot, '600x400')
    : '';

  const author = project.expand?.user;
  const authorAvatar = getAvatarUrl(author);
  const authorName = author?.username || 'developer';

  const formattedDate = project.created
    ? new Date(project.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete?.(project.id);
  };

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={handleCardKeyDown}
        aria-label={`View ${project.title}`}
        className={`group relative bg-[#080808] rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer select-none border border-[#2a2a2a] hover:border-[#404040] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out will-change-transform animate-fade-up motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
      >
        <div>
          <div className="relative aspect-video w-full bg-[#141414] overflow-hidden border-b border-[#2a2a2a]">
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt={`${project.title} screenshot`}
                className="w-full h-full object-cover group-hover:scale-[1.06] group-hover:blur-md group-focus-visible:scale-[1.06] group-focus-visible:blur-md transition-[transform,filter] duration-200 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#5c5c5c] group-hover:blur-md group-focus-visible:blur-md transition-[filter] duration-200 ease-out motion-reduce:transition-none">
                <ImageIcon className="w-7 h-7 mb-2 text-[#3a3a3a]" />
                <span className="text-xs">No screenshot</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none flex items-center justify-center">
              <span className="text-sm font-medium text-[#fafafa] tracking-wide">
                View project
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 min-w-0 mb-3">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#141414] border border-[#2a2a2a] shrink-0">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1e1e1e]" />
                )}
              </div>
              <span className="text-xs text-[#8a8a8a] truncate">{authorName}</span>
              {formattedDate && (
                <span className="text-xs text-[#5c5c5c]">· {formattedDate}</span>
              )}
            </div>

            <h3 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa] group-hover:text-[#b8b8b8] transition-colors duration-150 motion-reduce:transition-none mb-3">
              {project.title}
            </h3>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md text-[#8a8a8a] border border-[#2a2a2a]"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="text-[11px] text-[#5c5c5c] self-center">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#8a8a8a] group-hover:text-[#fafafa] transition-colors duration-150 motion-reduce:transition-none inline-flex items-center gap-1">
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </span>

          {canManage && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              onKeyDown={(e) => e.stopPropagation()}
              className={`text-[13px] text-[#ef4444] hover:text-[#fca5a5] transition-colors duration-150 rounded-md px-1.5 py-0.5 -mr-1.5 ${focusRing}`}
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