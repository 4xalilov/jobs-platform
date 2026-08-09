import { uz, type Dictionary } from "./locales/uz";
import { uzCyrl } from "./locales/uz-cyrl";
import { ru } from "./locales/ru";

export const locales = ["uz", "uz-cyrl", "ru"] as const;
export type Locale = (typeof locales)[number];

/** Standart til — o'zbek (lotin) */
export const defaultLocale: Locale = "uz";

export const dictionaries: Record<Locale, Dictionary> = {
  uz,
  "uz-cyrl": uzCyrl,
  ru,
};

/** <html lang> atributi uchun */
export const htmlLang: Record<Locale, string> = {
  uz: "uz-Latn",
  "uz-cyrl": "uz-Cyrl",
  ru: "ru",
};

export const LOCALE_STORAGE_KEY = "ish.locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export type { Dictionary };
