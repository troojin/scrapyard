'use client';

import React, { useState } from 'react';
import type { FileTreeItem } from '@/types';
import { formatBytes } from '@/lib/archiveValidator';
import { FileCode, FolderArchive, Search, CheckCircle2 } from 'lucide-react';

interface FileTreePreviewProps {
  files?: FileTreeItem[];
  className?: string;
  maxInitialDisplay?: number;
}

export function FileTreePreview({ files = [], className = '', maxInitialDisplay = 10 }: FileTreePreviewProps) {
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(false);

  if (!files || files.length === 0) {
    return (
      <div className={`p-4 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] text-center text-xs text-[#8a8a8a] ${className}`}>
        No archive contents preview available.
      </div>
    );
  }

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const matchingFiles = filter.trim()
    ? files.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase().trim()))
    : files;

  const displayedFiles = expanded ? matchingFiles : matchingFiles.slice(0, maxInitialDisplay);

  return (
    <div className={`rounded-xl border border-[#2a2a2a] bg-[#0c0c0c] overflow-hidden ${className}`}>
      <div className="p-3.5 border-b border-[#2a2a2a] bg-[#121212] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderArchive className="w-4 h-4 text-[#fafafa]" />
          <span className="text-xs font-semibold text-[#fafafa] tracking-wide">
            Archive Contents Preview
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </span>
        </div>
        <div className="text-[11px] text-[#8a8a8a]">
          {files.length} files · {formatBytes(totalBytes)} uncompressed
        </div>
      </div>

      {files.length > 6 && (
        <div className="p-2.5 border-b border-[#2a2a2a] bg-[#080808]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5c5c]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search files inside archive..."
              className="w-full bg-[#121212] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#fafafa] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#fafafa]/40 transition-colors"
            />
          </div>
        </div>
      )}

      <div className="divide-y divide-[#1a1a1a] max-h-60 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
        {displayedFiles.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#5c5c5c]">No files match your search.</div>
        ) : (
          displayedFiles.map((file, idx) => (
            <div
              key={`${file.path}-${idx}`}
              className="flex items-center justify-between px-3.5 py-2 text-xs font-mono hover:bg-[#141414] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileCode className="w-3.5 h-3.5 text-[#8a8a8a] shrink-0" />
                <span className="truncate text-[#e5e5e5]">{file.path}</span>
              </div>
              <span className="text-[11px] text-[#737373] shrink-0">
                {formatBytes(file.size)}
              </span>
            </div>
          ))
        )}
      </div>

      {matchingFiles.length > maxInitialDisplay && (
        <div className="p-2 border-t border-[#2a2a2a] bg-[#080808] text-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#8a8a8a] hover:text-[#fafafa] font-medium transition-colors"
          >
            {expanded ? 'Show less' : `View all ${matchingFiles.length} files`}
          </button>
        </div>
      )}
    </div>
  );
}
