/**
 * Rang hisoblari — WCAG 2.2 kontrast va yordamchi o'zgartirishlar.
 *
 * Alohida fayl: build-themes ham, check-contrast ham, brend rangini
 * tanlash skripti ham shu bitta formuladan foydalanadi. Ikki joyda
 * yozilsa, biri boshqasidan chetga chiqib ketardi.
 */

/** "#RRGGBB" yoki "#RGB" → [r, g, b] */
export function toRgb(hex) {
  const value = hex.replace("#", "").trim();
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Rang tushunarsiz: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

export function toHex([r, g, b]) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [r, g, b]
      .map((n) => clamp(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function channelLuminance(value) {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  const [r, g, b] = toRgb(hex).map(channelLuminance);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 kontrast nisbati: 1 (bir xil) … 21 (qora/oq) */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const ratio = (a, b) => Math.round(contrast(a, b) * 100) / 100;

/**
 * Rangni oqartirish yoki qoraytirish — hue saqlanadi.
 * amount: -1 (qoraga) … +1 (oqqa)
 */
export function shade(hex, amount) {
  const rgb = toRgb(hex);
  const target = amount > 0 ? 255 : 0;
  const k = Math.abs(amount);
  return toHex(rgb.map((c) => c + (target - c) * k));
}

/**
 * Berilgan fon uchun kerakli kontrastga yetguncha rangni qoraytiradi
 * (yoki oqartiradi). Hue o'zgarmaydi, faqat yorug'lik.
 *
 * Nima uchun kerak: "bu rangni AA ga moslash" ni qo'lda qilish —
 * o'nlab marta hex ni tuzatib, har safar qayta o'lchash degani.
 */
export function fitContrast(hex, background, needed, direction) {
  const towards = direction ?? (luminance(background) > 0.4 ? -1 : 1);
  let best = hex;
  for (let step = 0; step <= 100; step++) {
    const candidate = shade(hex, (towards * step) / 100);
    best = candidate;
    if (contrast(candidate, background) >= needed) return candidate;
  }
  return best;
}
