'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const linkCls = 'text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors';
const headCls = `${inter.className} text-sm font-semibold tracking-[-0.01em] text-[#fafafa] mb-1.5`;

export function Footer() {
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className={`${inter.className} relative isolate overflow-hidden w-full border-t border-[#1a1a1a] bg-[#030303] px-4 sm:px-8 pt-16 pb-10 antialiased`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/globe.jpg"
          alt=""
          width={1200}
          height={798}
          sizes="(min-width: 1024px) 760px, 560px"
          className="absolute max-w-none select-none w-[560px] lg:w-[760px] -right-24 -bottom-28 lg:-right-16 lg:-bottom-40 opacity-50 sm:opacity-70 mix-blend-screen blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]/50" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-x-12 gap-y-10 mb-14 items-start">
          <div className="flex flex-col gap-4 md:pr-8">
            <span className="text-xl font-semibold tracking-[-0.025em] text-[#fafafa]">
              Scrapyard
            </span>
            <p className="text-sm leading-[1.75] text-[#656565] max-w-xs">
              A home for abandoned code. Share what you built, why you stopped, and what’s still
              worth reusing.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <span className={headCls}>Product</span>
            <Link href="/" className={linkCls}>
              Catalog
            </Link>
            <Link href="/submit" className={linkCls}>
              Dump Project
            </Link>
            <Link href="/purchases" className={linkCls}>
              Purchased Codebases
            </Link>
            <Link href="/profile" className={linkCls}>
              Profile
            </Link>
          </div>

          <div className="flex flex-col gap-3.5">
            <span className={headCls}>Legal</span>
            <Link href="/terms" className={linkCls}>
              Terms of Service
            </Link>
            <Link href="/privacy" className={linkCls}>
              Privacy Policy
            </Link>
            <Link href="/refunds" className={linkCls}>
              Refund Policy
            </Link>
            <Link href="/dmca" className={linkCls}>
              DMCA Notice
            </Link>
          </div>
        </div>

        <div className="border-t border-[#141414] pt-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-xs text-[#5c5c5c]">
            © {year}{' '}
            <a
              href="https://troojin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
            >
              troojin
            </a>
            . All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}