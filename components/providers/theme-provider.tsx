"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createStorageStore, useSystemPrefersDark } from "@/lib/client-store";
import themes from "@/styles/themes.json";

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
    // v3: tema <html class="theme-light|theme-dark"> orqali almashadi
    const root = document.documentElement;
    const wasDark = root.classList.contains("theme-dark");
    const isDark = resolved === "dark";

    /*
     * Ranglar 200ms bilan o'tsin (§6.2). O'tish faqat almashinuv
     * lahzasida yoqiladi, doimiy emas: har elementda doimiy rang
     * o'tishi qoldirilsa scroll paytida ham hisoblanadi va kadr
     * tushiradi. Scroll ketayotgan bo'lsa umuman yoqilmaydi.
     */
    const changing = wasDark !== isDark && !isScrolling();
    if (changing) root.classList.add("theme-switching");

    root.classList.toggle("theme-dark", isDark);
    root.classList.toggle("theme-light", !isDark);
    // Brauzerning o'zi ham to'g'ri fon va boshqaruv elementlarini chizsin
    root.style.colorScheme = isDark ? "dark" : "light";

    /*
     * Status bar rangi. Faqat media so'rovli meta yetmaydi: tizim
     * tungi rejimda bo'lsayu foydalanuvchi yorug'ni tanlagan bo'lsa,
     * media so'rov hali ham tungi rangni beradi.
     */
    setThemeColorMeta(isDark ? themes.dark.surface.base : themes.light.surface.base);

    if (!changing) return;
    const timer = setTimeout(() => root.classList.remove("theme-switching"), 220);
    return () => clearTimeout(timer);
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

/** Meta teg bitta — media so'rovlilari o'rniga jonli qiymat qo'yiladi */
function setThemeColorMeta(color: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = color;
}

/** Scroll ketayotgan bo'lsa rang o'tishini yoqmaymiz */
let lastScrollAt = 0;
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => (lastScrollAt = Date.now()), { passive: true });
}
function isScrolling() {
  return Date.now() - lastScrollAt < 150;
}

/**
 * Sahifa chizilishidan oldin ishga tushadi — tungi rejimda oq "chaqnash" bo'lmasligi uchun.
 */
export const themeInitScript = `(function(){try{var m=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("theme-dark",d);r.classList.toggle("theme-light",!d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
