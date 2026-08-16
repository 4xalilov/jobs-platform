"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Ekran o'tishlari va tab xotirasi (v4, §5).
 *
 * Uchta narsani hal qiladi:
 *
 * 1. Yo'nalish — oldinga o'ngdan chapga, orqaga aynan teskarisi,
 *    tablar orasida siljish yo'q (cross-fade).
 * 2. Har tab o'z yo'lini va scroll pozitsiyasini saqlaydi. Kanal ichidan
 *    Profilga o'tib qaytganda foydalanuvchi o'sha kanalda, o'sha joyda
 *    turadi.
 * 3. Navigatsiya qulfi — ikki marta tez bosilganda ikkita ekran
 *    ochilmaydi.
 *
 * Yo'nalish yo'llarni taqqoslab taxmin qilinmaydi — o'tishni boshlagan
 * funksiyaning o'zi aytadi. Taxmin qilish tarix stack'ini yuritishni
 * talab qilardi va u brauzer tugmasi bilan tez chalkashib ketardi.
 */

export type TabKey = "jobs" | "applications" | "messages" | "profile";

export type Direction = "forward" | "back" | "fade";

const TAB_ROOTS: Record<TabKey, string> = {
  jobs: "/jobs",
  applications: "/arizalarim",
  messages: "/messages",
  profile: "/profile",
};

const MEMORY_KEY = "ish.nav.tabs";

/** Yo'ldan tabni aniqlash */
export function tabOf(pathname: string): TabKey {
  if (pathname.startsWith("/arizalarim")) return "applications";
  if (pathname.startsWith("/messages") || pathname.startsWith("/chat")) return "messages";
  if (pathname.startsWith("/profile") || pathname.startsWith("/card")) return "profile";
  if (pathname.startsWith("/saved")) return "profile";
  return "jobs";
}

export function tabRoot(tab: TabKey): string {
  return TAB_ROOTS[tab];
}

/* ——— Yo'nalish do'koni ——— */

let direction: Direction = "fade";
const listeners = new Set<() => void>();

function setDirection(next: Direction) {
  if (direction === next) return;
  direction = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Ekran konteyneriga beriladigan animatsiya yo'nalishi */
export function useScreenTransition(): Direction {
  return useSyncExternalStore(
    subscribe,
    () => direction,
    () => "fade" as const,
  );
}

/**
 * Brauzerning orqaga tugmasi ham teskari animatsiya bersin.
 * Ilova ildizida bir marta ulanadi.
 */
export function usePopStateDirection() {
  useEffect(() => {
    const onPop = () => setDirection("back");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
}

/* ——— Tab xotirasi ——— */

type TabMemory = Partial<Record<TabKey, { path: string; scrollY: number }>>;

function readMemory(): TabMemory {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(MEMORY_KEY);
    return raw ? (JSON.parse(raw) as TabMemory) : {};
  } catch {
    return {};
  }
}

function writeMemory(memory: TabMemory) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // Xotira to'lgan bo'lsa jim o'tamiz — navigatsiya baribir ishlaydi
  }
}

export function rememberTab(path: string, scrollY: number) {
  const memory = readMemory();
  memory[tabOf(path)] = { path, scrollY };
  writeMemory(memory);
}

export function recallTab(tab: TabKey): { path: string; scrollY: number } | null {
  return readMemory()[tab] ?? null;
}

/* ——— O'tish ——— */

/**
 * Scroll pozitsiyasini tiklaydi.
 *
 * Bitta requestAnimationFrame yetmaydi: yangi sahifa hali chizilmagan
 * bo'lsa hujjat kalta bo'ladi va scroll eng pastki mumkin bo'lgan
 * qiymatga qisqaradi (400 o'rniga 329 ga tushib qolardi). Shuning uchun
 * mo'ljalga yetguncha bir necha kadr qayta urinamiz — bu 300ms
 * chegarasidan chiqmaydi.
 */
function restoreScroll(top: number) {
  if (top <= 0) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  let attempts = 0;
  const attempt = () => {
    window.scrollTo({ top, behavior: "instant" });
    if (Math.abs(window.scrollY - top) > 1 && attempts++ < 12) {
      requestAnimationFrame(attempt);
    }
  };
  requestAnimationFrame(attempt);
}

/** Ikki marta tez bosilganda ikkinchisi e'tiborsiz qoladi (§5.5) */
function useNavigationLock() {
  const pathname = usePathname();
  const locked = useRef(false);

  useEffect(() => {
    locked.current = false;
  }, [pathname]);

  return useCallback((run: () => void) => {
    if (locked.current) return;
    locked.current = true;
    // Har o'tish 300ms dan oshmaydi — qulf ham shundan uzoq turmaydi
    setTimeout(() => {
      locked.current = false;
    }, 320);
    run();
  }, []);
}

/** Ichkariga o'tish: o'ngdan chapga siljish */
export function useForwardNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const guard = useNavigationLock();

  return useCallback(
    (href: string) => {
      if (href === pathname) return;
      guard(() => {
        setDirection("forward");
        rememberTab(pathname, window.scrollY);
        router.push(href);
      });
    },
    [guard, pathname, router],
  );
}

/** Orqaga: aynan teskari siljish */
export function useBackNavigation() {
  const router = useRouter();
  const guard = useNavigationLock();

  return useCallback(
    (href?: string) => {
      guard(() => {
        setDirection("back");
        if (href) router.push(href);
        else router.back();
      });
    },
    [guard, router],
  );
}

/**
 * Tab bosilganda: o'sha tab qayerda qolgan bo'lsa o'sha yerga qaytadi,
 * scroll ham tiklanadi (§5.2). Siljish yo'q — cross-fade.
 */
export function useTabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const guard = useNavigationLock();

  return useCallback(
    (tab: TabKey) => {
      // Faol tab qayta bosildi — tepaga qaytamiz
      if (tabOf(pathname) === tab) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      guard(() => {
        setDirection("fade");
        rememberTab(pathname, window.scrollY);

        const remembered = recallTab(tab);
        router.push(remembered?.path ?? tabRoot(tab), { scroll: false });

        restoreScroll(remembered?.scrollY ?? 0);
      });
    },
    [guard, pathname, router],
  );
}
