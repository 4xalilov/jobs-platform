"use client";

import { apiPost } from "@/lib/api";
import { idbClear } from "@/lib/idb";

/**
 * Chiqish.
 *
 * Sessiya cookie'sini o'chirish yetmaydi: kesh qatlamlari qo'shilgandan
 * keyin foydalanuvchining kanallari, arizalari va ochgan sahifalari
 * qurilmada qoladi. Umumiy telefonda keyingi odam ularni ko'rib qolardi.
 * Shuning uchun chiqishda uchala qatlam ham tozalanadi.
 */
export async function signOut(): Promise<void> {
  await apiPost("/auth/logout").catch(() => undefined);

  // 2-qatlam: IndexedDB
  await idbClear().catch(() => undefined);

  // 3-qatlam: Cache Storage — service worker o'zi tozalaydi
  const worker = navigator.serviceWorker?.controller;
  if (worker) worker.postMessage("clear-cache");

  /*
   * 1-qatlam: localStorage — faqat foydalanuvchiga tegishlilari.
   * Ko'rinish va til qurilma sozlamasi, ular qoladi.
   */
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("ish.") && key !== "ish.theme" && key !== "ish.locale") {
        localStorage.removeItem(key);
      }
    }
    sessionStorage.clear();
  } catch {
    // Xotira o'chirilgan bo'lsa ham chiqish davom etadi
  }
}
