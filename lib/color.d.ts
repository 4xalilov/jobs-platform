/**
 * `lib/color.mjs` uchun turlar.
 *
 * Formula .mjs da: uni build skriptlari (Node) ham, dizayn sinov maydoni
 * (brauzer) ham bir xil manbadan oladi. Ikki nusxa bo'lsa, biri
 * boshqasidan chetga chiqib ketardi va "kontrast to'g'ri" degan
 * tekshiruv yolg'on chiqardi.
 */
export function toRgb(hex: string): [number, number, number];
export function toHex(rgb: readonly number[]): string;
export function luminance(hex: string): number;
export function contrast(a: string, b: string): number;
export function ratio(a: string, b: string): number;
export function shade(hex: string, amount: number): string;
export function fitContrast(
  hex: string,
  background: string,
  needed: number,
  direction?: 1 | -1,
): string;
