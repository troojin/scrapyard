'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

export type ListingType = 'all' | 'free' | 'sale';

type FeedFilterCtx = {
  search: string;
  setSearch: (v: string) => void;
  selectedTag: string;
  setSelectedTag: (v: string) => void;
  listingType: ListingType;
  setListingType: (v: ListingType) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  docked: boolean;
  setDocked: (v: boolean) => void;
  resetFilters: () => void;
};

const Ctx = createContext<FeedFilterCtx | null>(null);

export function FeedFilterProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [listingType, setListingType] = useState<ListingType>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    const min = params.get('min') || params.get('minPrice');
    const max = params.get('max') || params.get('maxPrice');
    const type = params.get('type') || params.get('listingType');
    const tag = params.get('tag');
    const q = params.get('q') || params.get('search');

    if (min) setMinPrice(min);
    if (max) setMaxPrice(max);
    if (type === 'free' || type === 'sale' || type === 'all') setListingType(type);
    if (tag) setSelectedTag(tag);
    if (q) setSearch(q);
  }, []);

  const updateUrlParams = (min: string, max: string, type: ListingType) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    if (min) params.set('min', min);
    else params.delete('min');

    if (max) params.set('max', max);
    else params.delete('max');

    if (type !== 'all') params.set('type', type);
    else params.delete('type');

    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleMinPrice = (val: string) => {
    setMinPrice(val);
    updateUrlParams(val, maxPrice, listingType);
  };

  const handleMaxPrice = (val: string) => {
    setMaxPrice(val);
    updateUrlParams(minPrice, val, listingType);
  };

  const handleListingType = (val: ListingType) => {
    setListingType(val);
    updateUrlParams(minPrice, maxPrice, val);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedTag('All');
    setListingType('all');
    setMinPrice('');
    setMaxPrice('');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const value = useMemo(
    () => ({
      search,
      setSearch,
      selectedTag,
      setSelectedTag,
      listingType,
      setListingType: handleListingType,
      minPrice,
      setMinPrice: handleMinPrice,
      maxPrice,
      setMaxPrice: handleMaxPrice,
      docked,
      setDocked,
      resetFilters,
    }),
    [search, selectedTag, listingType, minPrice, maxPrice, docked]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFeedFilter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFeedFilter must be used inside FeedFilterProvider');
  return ctx;
}
