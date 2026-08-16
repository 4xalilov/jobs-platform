import { clsx, type ClassValue } from "clsx";

/**
 * Sinf nomlarini qo'shadi.
 *
 * Ilgari bu yerda tailwind-merge ham bor edi — u ziddiyatli utility
 * sinflarni tozalardi. Uslublar SCSS Modules ga o'tgach kerak
 * bo'lmay qoldi: modul sinflari hashlangan va bir-biri bilan
 * to'qnashmaydi.
 */
export function cx(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** 4200000 -> "4 200 000" */
export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Maosh diapazoni: "4 200 000 – 6 000 000 so'm".
 * Ikkala chegara ham bo'lmasa — "Kelishilgan holda".
 */
export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
  negotiable: string,
): string {
  if (!min && !max) return negotiable;
  if (min && max) return `${formatNumber(min)} – ${formatNumber(max)} ${currency}`;
  return `${formatNumber((min ?? max) as number)} ${currency}`;
}

/**
 * Qisqa maosh — "5–7 mln so'm".
 *
 * Vakansiya qatorining uchinchi qatorida maosh eng ko'zga tashlanadigan
 * element bo'lishi kerak (v4, §4.1). To'liq shakl ("5 000 000 – 7 000 000
 * so'm") telefonda bandlik chipi bilan bir qatorga sig'maydi, shuning
 * uchun ro'yxatda qisqasi, sheet ichida to'lig'i ishlatiladi.
 */
export function formatSalaryShort(
  min: number | null,
  max: number | null,
  million: string,
  currency: string,
  negotiable: string,
): string {
  if (!min && !max) return negotiable;
  const toMln = (value: number) => {
    const mln = value / 1_000_000;
    // 4.5 mln — kasr faqat kerak bo'lganda
    return Number.isInteger(mln) ? String(mln) : mln.toFixed(1).replace(".", ",");
  };
  if (min && max) return `${toMln(min)}–${toMln(max)} ${million} ${currency}`;
  return `${toMln((min ?? max) as number)} ${million} ${currency}`;
}

/**
 * "Necha vaqt oldin" — turg'un qiymatdan hisoblanadi, shuning uchun
 * server va mijozda bir xil chiqadi.
 */
export function formatAgo(
  minutesAgo: number,
  labels: {
    now: string;
    minutesShort: string;
    hoursShort: string;
    daysShort: string;
    yesterday: string;
  },
): string {
  if (minutesAgo < 2) return labels.now;
  if (minutesAgo < 60) return `${minutesAgo} ${labels.minutesShort}`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours} ${labels.hoursShort}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return labels.yesterday;
  return `${days} ${labels.daysShort}`;
}

/** Avatar uchun turg'un rang — nomdan hisoblanadi */
/**
 * Peer ranglari — logo bo'lmaganda nom bosh harfi shu ranglardan biri bilan
 * chiziladi. Qiymatlar themes.json da, bu yerda faqat CSS o'zgaruvchisi nomi:
 * shunda rang kodda takrorlanmaydi.
 */
const PEER_COUNT = 7;

export function peerIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % PEER_COUNT;
}

/** Nomdan turg'un rang — har safar bir xil chiqadi */
export function avatarColor(seed: string): string {
  return `var(--color-peer-${peerIndex(seed)})`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}
