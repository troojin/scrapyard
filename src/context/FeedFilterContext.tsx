'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export const TAG_FILTERS = [
  'All',
  'TypeScript',
  'Rust',
  'Go',
  'JavaScript',
  'Algorithms',
  'Security',
  'WebGL',
  'Game Dev',
];

type FeedFilterCtx = {
  search: string;
  setSearch: (v: string) => void;
  selectedTag: string;
  setSelectedTag: (v: string) => void;
  docked: boolean;
  setDocked: (v: boolean) => void;
};

const Ctx = createContext<FeedFilterCtx | null>(null);

export function FeedFilterProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [docked, setDocked] = useState(false);

  const value = useMemo(
    () => ({ search, setSearch, selectedTag, setSelectedTag, docked, setDocked }),
    [search, selectedTag, docked]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFeedFilter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFeedFilter must be used inside FeedFilterProvider');
  return ctx;
}