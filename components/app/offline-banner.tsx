"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { IconBellOff } from "@/components/ui/icon";
import styles from "./offline.module.scss";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Tarmoq holati. Server tomonda doim "onlayn" — gidratsiya buzilmasin. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

/**
 * Oflayn chizig'i va service worker ro'yxatdan o'tkazish.
 *
 * Chiziq modal emas: ilova oflaynda ham ishlaydi (keshdan chiziladi),
 * shuning uchun foydalanuvchining yo'lini to'sish noto'g'ri bo'lardi —
 * u faqat nima uchun ma'lumot yangilanmayotganini tushuntiradi.
 */
export function OfflineBanner() {
  const { t } = useI18n();
  const online = useOnline();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Ro'yxatdan o'tkazish sahifa yuklanib bo'lgach — birinchi
    // chizishga xalaqit bermasin
    const register = () => void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  if (online) return null;

  return (
    <div className={styles.banner} role="status">
      <IconBellOff size={14} />
      {t.offline.banner}
    </div>
  );
}
