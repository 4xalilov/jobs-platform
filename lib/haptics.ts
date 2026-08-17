"use client";

/**
 * Haptik javob — uchta daraja (v5, 2.7).
 *
 * Nega kerak: ishora haptiksiz — bu taxmin. Foydalanuvchi tortdi,
 * ekranda nimadir o'zgardi, lekin qo'l hech narsa sezmadi va u
 * "bosildimi?" deb ikkinchi marta bosadi. Haptik bilan — bu tasdiq.
 *
 * Nega kutubxona emas: butun mantiq `navigator.vibrate` ustidagi
 * uchta raqam. Kutubxona bunga 3 kB qo'shardi.
 *
 * Muhim: iOS Safari `vibrate` ni qo'llab-quvvatlamaydi. Shuning uchun
 * haptik **hech qachon yagona javob bo'lmasligi kerak** — u vizual
 * javobning ustiga qo'shiladi, o'rniga emas.
 */

export type Haptic = "select" | "confirm" | "reject";

/**
 * Naqshlar millisekundda. Qisqa: ular sezilishi kerak, lekin
 * e'tiborni tortmasligi kerak.
 *
 *   select  — tanlash, obuna, saqlash: bitta yengil turtki
 *   confirm — ariza yuborildi, nomzod chaqirildi: ikkita, o'sib boruvchi
 *   reject  — rad etildi, xato: uchta teng, "yo'q" ohangida
 */
const PATTERNS: Record<Haptic, number | number[]> = {
  select: 10,
  confirm: [12, 40, 24],
  reject: [20, 60, 20, 60, 20],
};

let enabled: boolean | null = null;

/** Qurilma haptikni biladimi va foydalanuvchi harakatni kamaytirishni so'ramaganmi */
function allowed(): boolean {
  if (enabled !== null) return enabled;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    enabled = false;
    return false;
  }
  /*
   * `prefers-reduced-motion` faqat animatsiya haqida emas — u
   * "ortiqcha sezgi bermang" degan umumiy so'rov. Vestibulyar
   * sezgirlikda tebranish ham noxush bo'ladi.
   */
  enabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return enabled;
}

export function haptic(kind: Haptic): void {
  if (!allowed()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    // Brauzer rad etsa jim o'tamiz: vizual javob allaqachon berilgan
  }
}

/** Sinov uchun: keshni tozalaydi */
export function resetHapticsCache(): void {
  enabled = null;
}
