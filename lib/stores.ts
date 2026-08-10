"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createStorageStore } from "@/lib/client-store";

/**
 * Brauzerda qoladigan holat.
 *
 * Saqlangan vakansiyalar, arizalar va kartochka 4-bosqichda bazaga ko'chdi —
 * bu yerda faqat qurilmaga tegishli narsalar qoladi.
 */

const EMPTY: string[] = [];

function parseStrings(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

const queriesStore = createStorageStore<string[]>("ish.queries", parseStrings);

/** Foydalanuvchi kiritgan so'nggi qidiruvlar */
export function useRecentQueries() {
  const queries = useSyncExternalStore(queriesStore.subscribe, queriesStore.get, () => EMPTY);

  const remember = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = queriesStore.get();
    const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 8);
    queriesStore.set(JSON.stringify(next));
  }, []);

  const clear = useCallback(() => queriesStore.set(JSON.stringify([])), []);

  return { queries, remember, clear };
}

export type Role = "seeker" | "employer";

const roleStore = createStorageStore<Role>("ish.role", (raw) =>
  raw === "employer" ? "employer" : "seeker",
);

/**
 * Ish qidiruvchi yoki ish beruvchi ko'rinishi.
 * 5-bosqichda users.rol ustuniga bog'lanadi.
 */
export function useRole() {
  const role = useSyncExternalStore(roleStore.subscribe, roleStore.get, () => "seeker" as Role);
  const setRole = useCallback((next: Role) => roleStore.set(next), []);
  return { role, setRole };
}
