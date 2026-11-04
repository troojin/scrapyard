'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
