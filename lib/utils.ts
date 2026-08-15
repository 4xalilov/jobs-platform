import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Bizda ham shrift o'lchami, ham rang `text-` bilan boshlanadi
 * (`text-body` va `text-on-accent`). Sozlanmagan tailwind-merge ularni
 * bitta guruh deb biladi va keyingisi oldingisini o'chirib yuboradi —
 * shu sababli ko'k tugmadagi oq matn yo'qolgan edi. Guruhlarni ochiq
 * ro'yxat bilan ajratamiz.
 */
const FONT_SIZES = ["large", "nav", "title", "body", "caption", "section"];

const COLORS = [
  "accent",
  "accent-pressed",
  "accent-soft",
  "on-accent",
  "bg",
  "surface",
  "surface-elevated",
  "surface-pressed",
  "fill",
  "separator",
  "text",
  "text-secondary",
  "text-tertiary",
  "danger",
  "success",
  "warning",
  "skeleton",
  "skeleton-shine",
];

const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
      "text-color": [{ text: COLORS }],
    },
  },
});

/**
 * SCSS Modules ga ko'chgan komponentlar uchun — sinf nomlarini shunchaki
 * qo'shadi. tailwind-merge kerak emas: modul sinflari hashlangan va
 * ular orasida ziddiyat bo'lmaydi.
 */
export function cx(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
