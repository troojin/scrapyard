'use client';

import React, { useState } from 'react';
import type { Project } from '@/types';
import { getFileUrl, getAvatarUrl } from '@/lib/pocketbase';
import { ProjectDetailModal } from './ProjectDetailModal';
import { Image as ImageIcon } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
  canManage?: boolean;
  index?: number;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa]/30';

export function ProjectCard({ project, onDelete, canManage, index = 0 }: ProjectCardProps) {
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

  const isForSale = !!project.is_for_sale && typeof project.price === 'number' && project.price > 0;
  const tags = project.tags ?? [];

  const open = () => setIsModalOpen(true);

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
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
        onClick={open}
        onKeyDown={handleCardKeyDown}
        aria-label={`View ${project.title}`}
        style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
        className={`group flex flex-col rounded-xl overflow-hidden bg-[#080808] border border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer select-none transition-colors duration-150 animate-fade-up ${focusRing}`}
      >
        <div className="relative aspect-video w-full bg-[#141414] overflow-hidden">
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt={`${project.title} screenshot`}
              className="w-full h-full object-cover transition-[transform,filter] duration-200 ease-out group-hover:scale-[1.06] group-hover:blur-md group-focus-visible:scale-[1.06] group-focus-visible:blur-md motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[#5c5c5c] transition-[filter] duration-200 ease-out group-hover:blur-md group-focus-visible:blur-md motion-reduce:transition-none">
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">No screenshot</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 motion-reduce:transition-none pointer-events-none" />

          <span
            className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-md ${
              isForSale
                ? 'bg-[#fafafa] text-[#080808]'
                : 'bg-[#080808]/80 text-[#a3a3a3] border border-[#2a2a2a]'
            }`}
          >
            {isForSale ? `$${project.price}` : 'Free'}
          </span>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-base font-semibold tracking-[-0.01em] text-[#fafafa] line-clamp-1">
            {project.title}
          </h3>

          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0 text-xs text-[#8a8a8a]">
              <span className="w-5 h-5 rounded-full overflow-hidden bg-[#1e1e1e] shrink-0">
                {authorAvatar && (
                  <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                )}
              </span>
              <span className="truncate">{authorName}</span>
              {formattedDate && <span className="text-[#5c5c5c] shrink-0">{formattedDate}</span>}
            </div>

            {canManage && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                onKeyDown={(e) => e.stopPropagation()}
                className={`text-xs text-[#8a8a8a] hover:text-[#ef4444] transition-colors rounded-md px-1.5 py-0.5 -mr-1.5 shrink-0 ${focusRing}`}
              >
                Delete
              </button>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-md text-[#8a8a8a] border border-[#2a2a2a]"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && <span className="text-[11px] text-[#5c5c5c]">+{tags.length - 2}</span>}
            </div>
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