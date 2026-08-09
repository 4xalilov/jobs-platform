import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
const AVATAR_COLORS = [
  "#E17076",
  "#7BC862",
  "#E5CA77",
  "#65AADD",
  "#A695E7",
  "#EE7AAE",
  "#6EC9CB",
  "#FAA774",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}
