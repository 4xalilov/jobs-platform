"use client";

import { useEffect, useRef } from "react";

/**
 * Oddiy so'rov bilan kuzatish.
 *
 * WebSocket emas — sabab: PWA telefonda fon rejimiga tez-tez tushadi, uzilgan
 * ulanishni tiklash kodini saqlash qimmat, chat trafigi esa kichkina. Ekran
 * ko'rinmay qolsa so'rov to'xtaydi, qaytganda darhol bir marta so'raladi —
 * shuning uchun ochiq turgan ilova batareyani yemaydi.
 */
export function usePolling(callback: () => Promise<void> | void, intervalMs: number) {
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        try {
          await latest.current();
        } catch {
          // tarmoq uzildi — keyingi urinishda o'zi tiklanadi
        }
      }
      if (!stopped) timer = setTimeout(run, intervalMs);
    };

    timer = setTimeout(run, intervalMs);

    const onVisibility = () => {
      if (stopped || document.visibilityState !== "visible") return;
      clearTimeout(timer);
      void run();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);
}
