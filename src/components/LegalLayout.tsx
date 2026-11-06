import React from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-24 antialiased`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to catalog</span>
        </Link>

        <header className="mt-8 mb-10 pb-8 border-b border-[#2a2a2a]">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em]">{title}</h1>
          <p className="text-sm text-[#8a8a8a] mt-2 leading-relaxed">{intro}</p>
        </header>

        <div className="space-y-9">{children}</div>
      </div>
    </div>
  );
}

const prose =
  'space-y-3 text-sm leading-7 text-[#a3a3a3] ' +
  '[&_strong]:font-medium [&_strong]:text-[#fafafa] ' +
  '[&_a]:text-[#fafafa] [&_a]:underline [&_a]:underline-offset-4 ' +
  '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:space-y-1.5 [&_ol]:space-y-1.5 ' +
  '[&_code]:font-mono [&_code]:text-xs [&_code]:text-[#fafafa] [&_code]:bg-[#141414] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded';

export function Section({
  title,
  boxed = false,
  children,
}: {
  title: string;
  boxed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`${prose} ${boxed ? 'rounded-xl p-5 shadow-[inset_0_0_0_1px_#2a2a2a]' : ''}`}
    >
      <h2 className="text-base font-medium text-[#fafafa] tracking-tight">{title}</h2>
      {children}
    </section>
  );
}