"use client";

import { useEffect, useState } from "react";
import { idbGetStale, idbSet } from "@/lib/idb";

/**
 * Ro'yxatni IndexedDB da saqlaydi va oflaynda undan tiklaydi.
 *
 * Nima uchun bu kerak, agar service worker sahifani baribir keshlasa:
 * Cache Storage javoblarni MANZIL bo'yicha saqlaydi. Foydalanuvchi
 * oflaynda hech qachon ochmagan tabga o'tsa, o'sha manzil keshda
 * bo'lmaydi va sahifa bo'sh keladi. IndexedDB esa ma'lumotni manzildan
 * ajratib saqlaydi — shuning uchun ro'yxat baribir chiziladi.
 *
 * Qaytaradi: ko'rsatiladigan ro'yxat va u keshdan kelganmi.
 */
export function useCachedList<T>(
  key: string,
  fromServer: T[],
): {
  items: T[];
  fromCache: boolean;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
} {
  const [items, setItems] = useState<T[]>(fromServer);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (fromServer.length > 0) {
      // Serverdan haqiqiy ma'lumot keldi — keshni yangilaymiz
      void idbSet(key, fromServer);
      return;
    }

    /*
     * Bo'sh keldi. Ikki sabab bo'lishi mumkin: haqiqatan bo'sh, yoki
     * oflaynda server javob bermagan. Keshda nimadir bo'lsa uni
     * ko'rsatamiz — eski ma'lumot bo'sh ekrandan yaxshiroq.
     * setState async callback ichida: effekt tanasida emas.
     */
    let cancelled = false;
    void idbGetStale<T[]>(key).then((cached) => {
      if (cancelled || !cached || cached.length === 0) return;
      setItems(cached);
      setFromCache(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key, fromServer]);

  return { items, fromCache, setItems };
}
