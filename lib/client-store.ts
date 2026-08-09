import { useSyncExternalStore } from "react";

type Listener = () => void;

/**
 * localStorage ustidagi kichik store.
 * useSyncExternalStore bilan ishlatiladi — server va mijoz qiymatlari
 * turlicha bo'lsa ham React uni to'g'ri hal qiladi.
 */
export function createStorageStore<T>(key: string, parse: (raw: string | null) => T) {
  const listeners = new Set<Listener>();
  let cachedRaw: string | null = null;
  let cached: T | null = null;
  let primed = false;

  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      window.addEventListener("storage", listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
      };
    },
    /** Snapshot barqaror bo'lishi shart — qiymat o'zgarmasa, xuddi shu obyekt qaytadi */
    get(): T {
      const raw = window.localStorage.getItem(key);
      if (!primed || raw !== cachedRaw) {
        cachedRaw = raw;
        cached = parse(raw);
        primed = true;
      }
      return cached as T;
    },
    set(value: string) {
      window.localStorage.setItem(key, value);
      primed = false;
      notify();
    },
  };
}

const subscribeSystemTheme = (listener: Listener) => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
};

const getSystemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

/** Qurilma tungi rejimda ekanmi */
export function useSystemPrefersDark(): boolean {
  return useSyncExternalStore(subscribeSystemTheme, getSystemTheme, () => false);
}

const noopSubscribe = () => () => {};

/** Brauzerda ekanligimizni bildiradi — portal uchun kerak */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
