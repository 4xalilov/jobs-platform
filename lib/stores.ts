"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createStorageStore } from "@/lib/client-store";
import { defaultCard, type CandidateCard } from "@/lib/mock-data";

const EMPTY: string[] = [];

function parseIds(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

const savedStore = createStorageStore<string[]>("ish.saved", parseIds);
const appliedStore = createStorageStore<string[]>("ish.applied", parseIds);
const queriesStore = createStorageStore<string[]>("ish.queries", parseIds);

const cardStore = createStorageStore<CandidateCard>("ish.card", (raw) => {
  if (!raw) return defaultCard;
  try {
    return { ...defaultCard, ...(JSON.parse(raw) as Partial<CandidateCard>) };
  } catch {
    return defaultCard;
  }
});

/** Saqlangan vakansiyalar */
export function useSaved() {
  const ids = useSyncExternalStore(savedStore.subscribe, savedStore.get, () => EMPTY);

  const toggle = useCallback((id: string) => {
    const current = savedStore.get();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
    savedStore.set(JSON.stringify(next));
  }, []);

  return { ids, toggle, isSaved: (id: string) => ids.includes(id) };
}

/** Yuborilgan arizalar */
export function useApplied() {
  const ids = useSyncExternalStore(appliedStore.subscribe, appliedStore.get, () => EMPTY);

  const apply = useCallback((id: string) => {
    const current = appliedStore.get();
    if (current.includes(id)) return;
    appliedStore.set(JSON.stringify([id, ...current]));
  }, []);

  return { ids, apply, hasApplied: (id: string) => ids.includes(id) };
}

/** Foydalanuvchi kiritgan so'nggi qidiruvlar */
export function useRecentQueries() {
  const queries = useSyncExternalStore(queriesStore.subscribe, queriesStore.get, () => EMPTY);

  const remember = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = queriesStore.get();
    const next = [trimmed, ...current.filter((q) => q !== trimmed)].slice(0, 8);
    queriesStore.set(JSON.stringify(next));
  }, []);

  const clear = useCallback(() => queriesStore.set(JSON.stringify([])), []);

  return { queries, remember, clear };
}

/** Nomzod kartochkasi */
export function useCard() {
  const card = useSyncExternalStore(cardStore.subscribe, cardStore.get, () => defaultCard);

  const save = useCallback((next: CandidateCard) => cardStore.set(JSON.stringify(next)), []);

  return { card, save };
}
