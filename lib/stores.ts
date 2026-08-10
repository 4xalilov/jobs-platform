"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createStorageStore } from "@/lib/client-store";
import {
  defaultCard,
  employerVacancies,
  type CandidateCard,
  type EmployerVacancy,
} from "@/lib/mock-data";

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

/* ——— Ish beruvchi ——— */

export type Role = "seeker" | "employer";

const roleStore = createStorageStore<Role>("ish.role", (raw) =>
  raw === "employer" ? "employer" : "seeker",
);

/** Foydalanuvchi roli — nomzod yoki ish beruvchi */
export function useRole() {
  const role = useSyncExternalStore(roleStore.subscribe, roleStore.get, () => "seeker" as Role);
  const setRole = useCallback((next: Role) => roleStore.set(next), []);
  return { role, setRole };
}

const EMPTY_VACANCIES: EmployerVacancy[] = [];

const myVacanciesStore = createStorageStore<EmployerVacancy[]>("ish.myVacancies", (raw) => {
  if (!raw) return EMPTY_VACANCIES;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EmployerVacancy[]) : EMPTY_VACANCIES;
  } catch {
    return EMPTY_VACANCIES;
  }
});

/**
 * Ish beruvchining vakansiyalari: namunaviylari + shu sessiyada joylanganlari.
 * Yangi joylangani tepada turadi.
 */
export function useMyVacancies() {
  const created = useSyncExternalStore(
    myVacanciesStore.subscribe,
    myVacanciesStore.get,
    () => EMPTY_VACANCIES,
  );

  const publish = useCallback((vacancy: EmployerVacancy) => {
    const current = myVacanciesStore.get();
    myVacanciesStore.set(JSON.stringify([vacancy, ...current]));
  }, []);

  const remove = useCallback((id: string) => {
    const current = myVacanciesStore.get();
    myVacanciesStore.set(JSON.stringify(current.filter((v) => v.id !== id)));
  }, []);

  return { vacancies: [...created, ...employerVacancies], created, publish, remove };
}
