import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import { FeedFilterProvider } from '@/context/FeedFilterContext';
import { keywords } from '@/lib/keywords';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Scrapyard',
  description:
    'A platform for developers to post abandoned side projects, explain why they stopped building, and share the salvageable parts of the code.',
  keywords,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100 font-sans">
        <FeedFilterProvider>
          <ClientProviders>{children}</ClientProviders>
        </FeedFilterProvider>
      </body>
    </html>
  );
}