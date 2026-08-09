import type { Locale } from "@/lib/i18n";

/**
 * Shartli ma'lumotlar — 1-bosqichda dizayn tizimini ko'rsatish uchun.
 * Keyingi bosqichda bazadan keladi (professions.nom_uz / nom_ru ustunlari kabi).
 */
export type Localized = Record<Locale, string>;

export function pick(text: Localized, locale: Locale): string {
  return text[locale];
}

export type Profession = { id: string; name: Localized };

export const professions: Profession[] = [
  { id: "sotuvchi", name: { uz: "Sotuvchi", "uz-cyrl": "Сотувчи", ru: "Продавец" } },
  { id: "oshpaz", name: { uz: "Oshpaz", "uz-cyrl": "Ошпаз", ru: "Повар" } },
  { id: "kuryer", name: { uz: "Kuryer", "uz-cyrl": "Курьер", ru: "Курьер" } },
  { id: "haydovchi", name: { uz: "Haydovchi", "uz-cyrl": "Ҳайдовчи", ru: "Водитель" } },
  { id: "kassir", name: { uz: "Kassir", "uz-cyrl": "Кассир", ru: "Кассир" } },
  { id: "ofitsiant", name: { uz: "Ofitsiant", "uz-cyrl": "Официант", ru: "Официант" } },
  { id: "farrosh", name: { uz: "Farrosh", "uz-cyrl": "Фаррош", ru: "Уборщик" } },
  { id: "sartarosh", name: { uz: "Sartarosh", "uz-cyrl": "Сартарош", ru: "Парикмахер" } },
  { id: "quruvchi", name: { uz: "Quruvchi", "uz-cyrl": "Қурувчи", ru: "Строитель" } },
];

export type Vacancy = {
  id: string;
  title: Localized;
  company: string;
  district: Localized;
  salaryMin: number | null;
  salaryMax: number | null;
  postedAt: Localized;
  fastReply: boolean;
  verified: boolean;
};

export const vacancies: Vacancy[] = [
  {
    id: "v1",
    title: { uz: "Sotuvchi", "uz-cyrl": "Сотувчи", ru: "Продавец" },
    company: "Chorsu Market",
    district: {
      uz: "Toshkent, Shayxontohur",
      "uz-cyrl": "Тошкент, Шайхонтоҳур",
      ru: "Ташкент, Шайхантахур",
    },
    salaryMin: 4_000_000,
    salaryMax: 6_000_000,
    postedAt: { uz: "2 soat", "uz-cyrl": "2 соат", ru: "2 ч" },
    fastReply: true,
    verified: true,
  },
  {
    id: "v2",
    title: {
      uz: "Oshpaz yordamchisi",
      "uz-cyrl": "Ошпаз ёрдамчиси",
      ru: "Помощник повара",
    },
    company: "Milano Cafe",
    district: {
      uz: "Toshkent, Yunusobod",
      "uz-cyrl": "Тошкент, Юнусобод",
      ru: "Ташкент, Юнусабад",
    },
    salaryMin: 5_000_000,
    salaryMax: 7_000_000,
    postedAt: { uz: "5 soat", "uz-cyrl": "5 соат", ru: "5 ч" },
    fastReply: false,
    verified: true,
  },
  {
    id: "v3",
    title: { uz: "Kuryer", "uz-cyrl": "Курьер", ru: "Курьер" },
    company: "Express Yetkazib",
    district: { uz: "Toshkent", "uz-cyrl": "Тошкент", ru: "Ташкент" },
    salaryMin: 6_000_000,
    salaryMax: 9_000_000,
    postedAt: { uz: "kecha", "uz-cyrl": "кеча", ru: "вчера" },
    fastReply: true,
    verified: false,
  },
  {
    id: "v4",
    title: { uz: "Kassir", "uz-cyrl": "Кассир", ru: "Кассир" },
    company: "Korzinka Chilonzor",
    district: {
      uz: "Toshkent, Chilonzor",
      "uz-cyrl": "Тошкент, Чилонзор",
      ru: "Ташкент, Чиланзар",
    },
    salaryMin: 4_500_000,
    salaryMax: null,
    postedAt: { uz: "kecha", "uz-cyrl": "кеча", ru: "вчера" },
    fastReply: false,
    verified: false,
  },
];

export type Chat = {
  id: string;
  company: string;
  lastMessage: Localized;
  time: string;
  unread: number;
};

export const chats: Chat[] = [
  {
    id: "c1",
    company: "Chorsu Market",
    lastMessage: {
      uz: "Ertaga soat 10 da kela olasizmi?",
      "uz-cyrl": "Эртага соат 10 да кела оласизми?",
      ru: "Сможете прийти завтра в 10?",
    },
    time: "14:32",
    unread: 2,
  },
  {
    id: "c2",
    company: "Milano Cafe",
    lastMessage: {
      uz: "Kartochkangizni ko'rdik, rahmat",
      "uz-cyrl": "Карточкангизни кўрдик, раҳмат",
      ru: "Посмотрели вашу карточку, спасибо",
    },
    time: "11:05",
    unread: 0,
  },
  {
    id: "c3",
    company: "Express Yetkazib",
    lastMessage: {
      uz: "Ish vaqti 9:00 dan 18:00 gacha",
      "uz-cyrl": "Иш вақти 9:00 дан 18:00 гача",
      ru: "График с 9:00 до 18:00",
    },
    time: "09:41",
    unread: 0,
  },
];

export const recentSearches: Localized[] = [
  { uz: "sotuvchi Chorsu", "uz-cyrl": "сотувчи Чорсу", ru: "продавец Чорсу" },
  { uz: "kuryer smenali", "uz-cyrl": "курьер сменали", ru: "курьер посменно" },
  { uz: "oshpaz Yunusobod", "uz-cyrl": "ошпаз Юнусобод", ru: "повар Юнусабад" },
];
