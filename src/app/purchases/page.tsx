'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchUserPurchases, hasUserPurchasedProject, recordDirectPurchase } from '@/lib/projectsApi';
import type { Purchase } from '@/types';
import { Inter } from 'next/font/google';
import {
  Download,
  CheckCircle2,
  FolderArchive,
  ArrowLeft,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Package,
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const focusRing = 'focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]';

function PurchasesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuccess = searchParams.get('success') === 'true';
  const successProjectId = searchParams.get('projectId');
  const isMock = searchParams.get('mock') === 'true';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const init = async () => {
      if (isSuccess && successProjectId) {
        const already = await hasUserPurchasedProject(user.id, successProjectId);
        if (!already) {
          await recordDirectPurchase(user.id, successProjectId, 20);
        }
      }

      const list = await fetchUserPurchases(user.id);
      setPurchases(list);
      setLoading(false);
    };

    init();
  }, [user, isSuccess, successProjectId]);

  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] pb-20 antialiased`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-6">
        <div className="mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to catalog</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#fafafa]">
          Your Purchased Codebases
        </h1>
        <p className="text-sm text-[#8a8a8a] mt-2">
          Download unlocked source archives and access repositories for projects you own licenses to.
        </p>

        {isSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#86efac] text-xs flex items-center justify-between gap-3 animate-fade-up">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
              <span>
                Payment successful! Your commercial license has been activated and source archive is unlocked.
              </span>
            </div>
            {isMock && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e]">
                Demo Mode
              </span>
            )}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-2">
        {!user ? (
          <div className="p-12 text-center border border-[#2a2a2a] rounded-xl bg-[#0c0c0c]">
            <Package className="w-8 h-8 mx-auto text-[#5c5c5c] mb-3" />
            <h2 className="text-base font-semibold text-[#fafafa] mb-1">Sign in to view your purchases</h2>
            <p className="text-xs text-[#8a8a8a] max-w-sm mx-auto mb-6">
              Connect your account to access your downloaded repositories and license receipts.
            </p>
            <Link
              href="/login"
              className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-[#fafafa] hover:bg-white text-[#080808] rounded-lg transition-colors ${focusRing}`}
            >
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-[#2a2a2a] bg-[#0c0c0c] animate-shimmer h-28" />
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2a2a2a] rounded-xl bg-[#0c0c0c]">
            <FolderArchive className="w-8 h-8 mx-auto text-[#5c5c5c] mb-3" />
            <h2 className="text-base font-semibold text-[#fafafa] mb-1">No purchases yet</h2>
            <p className="text-xs text-[#8a8a8a] max-w-sm mx-auto mb-6">
              Browse the catalog for abandoned side projects with salvageable modules and full source code.
            </p>
            <Link
              href="/?type=sale"
              className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-[#fafafa] hover:bg-white text-[#080808] rounded-lg transition-colors ${focusRing}`}
            >
              Explore For Sale Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((pur) => {
              const project = pur.expand?.project;
              const title = project?.title || 'Purchased Project Codebase';
              const createdDate = pur.created
                ? new Date(pur.created).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '';

              const downloadUrl = `/api/projects/${pur.project}/download?userId=${user.id}`;
              const githubUrl = project?.github_url;

              return (
                <div
                  key={pur.id}
                  className="p-5 rounded-xl border border-[#2a2a2a] bg-[#0c0c0c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#fafafa] tracking-tight">{title}</h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/25 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Commercial License</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#8a8a8a]">
                      {createdDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Purchased {createdDate}</span>
                        </span>
                      )}
                      {pur.amount && <span>· Paid ${pur.amount} USD</span>}
                      {project?.file_tree && (
                        <span>· {project.file_tree.length} files included</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-2 text-xs font-medium bg-transparent hover:bg-[#141414] text-[#fafafa] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg transition-colors flex items-center gap-1.5 ${focusRing}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Repo</span>
                      </a>
                    )}

                    <a
                      href={downloadUrl}
                      download
                      className={`px-4 py-2 text-xs font-medium bg-[#fafafa] hover:bg-white text-[#080808] rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(250,250,250,0.15)] ${focusRing}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .zip</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <Suspense
      fallback={
        <div className={`${inter.className} min-h-screen bg-[#080808] text-[#fafafa] p-12 text-center`}>
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-6 w-48 bg-[#141414] rounded animate-shimmer mx-auto" />
            <div className="h-28 bg-[#141414] rounded-xl animate-shimmer" />
          </div>
        </div>
      }
    >
      <PurchasesContent />
    </Suspense>
  );
}
