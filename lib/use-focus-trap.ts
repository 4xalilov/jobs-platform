"use client";

import { useEffect, type RefObject } from "react";

/**
 * Modal qatlam ichida fokus tuzog'i (v5, B2).
 *
 * Nega kerak: `aria-modal="true"` faqat ekran o'quvchiga ayta oladi,
 * lekin Tab tugmasini to'xtatmaydi. Tuzoqsiz foydalanuvchi sheet
 * ichidan chiqib, ko'rinmayotgan orqa fondagi tugmalar bo'ylab
 * yuradi va fokus qayerda ekani bilinmaydi. Qabul mezoni:
 * «hech qayerda fokus yo'qolmaydi».
 *
 * Uchta ish qiladi:
 *   1. Ochilganda fokusni ichkariga ko'chiradi (birinchi element yoki
 *      qatlamning o'zi);
 *   2. Tab va Shift+Tab ni halqa qilib qamab turadi;
 *   3. Yopilganda fokusni ochgan elementga qaytaradi.
 *
 * `tabindex="-1"` bo'lgan qatlamning o'zi ham fokus oladi — ichida
 * fokuslanadigan element bo'lmasa (masalan faqat matnli sheet)
 * fokus baribir ichkarida qoladi.
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    // Ko'rinmayotgan element fokus olmaydi — offsetParent shuni tekshiradi
    (node) => node.offsetParent !== null || node === document.activeElement,
  );
}

export function useFocusTrap(container: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return;

    /*
     * Ochgan elementni eslab qolamiz. Yopilganda fokus shu yerga
     * qaytadi, aks holda u <body> ga tushib ketadi va klaviatura
     * bilan yurish boshidan boshlanadi.
     */
    const opener = document.activeElement as HTMLElement | null;

    /*
     * Bir kadr kutamiz: qatlam yangi render bo'lgan va ichidagi
     * elementlar hali o'lchamga ega bo'lmagan bo'lishi mumkin,
     * o'lchamsiz element esa `offsetParent === null` beradi.
     */
    const frame = requestAnimationFrame(() => {
      const node = container.current;
      if (!node) return;
      const first = focusable(node)[0];
      (first ?? node).focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const node = container.current;
      if (!node) return;

      const items = focusable(node);
      if (items.length === 0) {
        // Ichida fokuslanadigan element yo'q — Tab hech qayerga bormaydi
        event.preventDefault();
        node.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (!node.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      /*
       * Ochgan element hali sahifada bo'lsa fokus unga qaytadi.
       * `isConnected` tekshiruvi kerak: qator o'chirilgan bo'lsa
       * (masalan obunani bekor qilgach) u endi DOM da yo'q.
       */
      if (opener?.isConnected) opener.focus();
    };
  }, [container, active]);
}
