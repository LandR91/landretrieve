"use client";

import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CompareItem = {
  id: string;
  title: string;
  prezzo: number;
  valuta: string;
  coverImage?: string;
};

type CompareStore = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],

  add: (item) => {
    const { items } = get();
    if (items.length >= 3) return;
    if (items.some((i) => i.id === item.id)) return;
    set({ items: [...items, item] });
  },

  remove: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  clear: () => set({ items: [] }),

  has: (id) => get().items.some((i) => i.id === id),
}));
