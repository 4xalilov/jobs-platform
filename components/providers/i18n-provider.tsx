"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createStorageStore } from "@/lib/client-store";
import {
  defaultLocale,
  dictionaries,
  htmlLang,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

const localeStore = createStorageStore<Locale>(LOCALE_STORAGE_KEY, (raw) =>
  isLocale(raw) ? raw : defaultLocale,
);

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Tarjimalar lug'ati — t.design.title ko'rinishida ishlatiladi */
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(localeStore.subscribe, localeStore.get, () => defaultLocale);

  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => localeStore.set(next), []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n I18nProvider ichida ishlatilishi kerak");
  return ctx;
}
