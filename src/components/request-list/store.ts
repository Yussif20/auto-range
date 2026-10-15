"use client";

import { useSyncExternalStore } from "react";

export type RequestItem = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  oemNumber: string;
  qty: number;
};

type State = { items: RequestItem[]; open: boolean };

const KEY = "autorange.requestList.v1";
const SERVER_STATE: State = { items: [], open: false };
const listeners = new Set<() => void>();
let state: State | null = null;

function read(): RequestItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function current(): State {
  state ??= { items: read(), open: false };
  return state;
}

function set(next: Partial<State>) {
  state = { ...current(), ...next };
  if (next.items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next.items));
    } catch {
      // Private mode or full storage: the list still works for this visit.
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) set({ items: read() });
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const requestList = {
  add(item: Omit<RequestItem, "qty">) {
    const items = current().items;
    const existing = items.find((i) => i.id === item.id);
    set({
      items: existing
        ? items.map((i) => (i.id === item.id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i))
        : [...items, { ...item, qty: 1 }],
      open: true,
    });
  },
  setQty(id: string, qty: number) {
    set({ items: current().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, 99)) } : i)) });
  },
  remove(id: string) {
    set({ items: current().items.filter((i) => i.id !== id) });
  },
  clear() {
    set({ items: [] });
  },
  setOpen(open: boolean) {
    set({ open });
  },
};

export function useRequestList() {
  return useSyncExternalStore(subscribe, current, () => SERVER_STATE);
}
