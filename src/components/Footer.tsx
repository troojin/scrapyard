import React from 'react';
import Link from 'next/link';
import { Wrench, Terminal, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 text-zinc-400 py-8 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Wrench className="w-3 h-3" />
          </div>
          <span className="font-bold text-zinc-200">SCRAPYARD</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500 text-[11px]">Abandoned code repository</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <Link href="/" className="hover:text-zinc-200 transition-colors">
            Catalog
          </Link>
          <Link href="/submit" className="hover:text-zinc-200 transition-colors">
            Dump Project
          </Link>
          <Link href="/profile" className="hover:text-zinc-200 transition-colors">
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <Database className="w-3 h-3 text-amber-500" />
          <span>PocketBase Backend ({process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8090'})</span>
        </div>
      </div>
    </footer>
  );
}
