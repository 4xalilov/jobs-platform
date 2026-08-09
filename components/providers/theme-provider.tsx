"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { createStorageStore, useSystemPrefersDark } from "@/lib/client-store";

export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "ish.theme";

function parseMode(raw: string | null): ThemeMode {
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

const themeStore = createStorageStore<ThemeMode>(THEME_STORAGE_KEY, parseMode);

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Haqiqiy qo'llanayotgan ko'rinish */
  resolved: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "system" as ThemeMode,
  );
  const systemPrefersDark = useSystemPrefersDark();

  const resolved: "light" | "dark" =
    mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  // Tashqi tizimni (DOM) React holatiga moslash
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => themeStore.set(next), []);

  const value = useMemo(() => ({ mode, setMode, resolved }), [mode, setMode, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme ThemeProvider ichida ishlatilishi kerak");
  return ctx;
}

/**
 * Sahifa chizilishidan oldin ishga tushadi — tungi rejimda oq "chaqnash" bo'lmasligi uchun.
 */
export const themeInitScript = `(function(){try{var m=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
