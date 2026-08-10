import type { Locale } from "@/lib/i18n";

/**
 * Dizayn tizimi sahifasi uchun namunaviy ma'lumot.
 * Faqat /design ekranida ishlatiladi — u bazaga bog'lanmasligi kerak,
 * chunki komponentlarni baza ko'tarilmagan holda ham ko'rish mumkin bo'lsin.
 */
export type Localized = Record<Locale, string>;

export type SampleVacancy = {
  id: string;
  title: Localized;
  company: string;
  location: Localized;
  salaryMin: number | null;
  salaryMax: number | null;
  postedMinutesAgo: number;
  fastReply: boolean;
  verified: boolean;
};

export const sampleProfessions: { id: string; name: Localized }[] = [
  { id: "sotuvchi", name: { uz: "Sotuvchi", "uz-cyrl": "Сотувчи", ru: "Продавец" } },
  { id: "kassir", name: { uz: "Kassir", "uz-cyrl": "Кассир", ru: "Кассир" } },
  { id: "oshpaz", name: { uz: "Oshpaz", "uz-cyrl": "Ошпаз", ru: "Повар" } },
  { id: "ofitsiant", name: { uz: "Ofitsiant", "uz-cyrl": "Официант", ru: "Официант" } },
  { id: "kuryer", name: { uz: "Kuryer", "uz-cyrl": "Курьер", ru: "Курьер" } },
  { id: "haydovchi", name: { uz: "Haydovchi", "uz-cyrl": "Ҳайдовчи", ru: "Водитель" } },
  { id: "farrosh", name: { uz: "Farrosh", "uz-cyrl": "Фаррош", ru: "Уборщик" } },
  { id: "sartarosh", name: { uz: "Sartarosh", "uz-cyrl": "Сартарош", ru: "Парикмахер" } },
];

export const sampleVacancies: SampleVacancy[] = [
  {
    id: "s1",
    title: { uz: "Sotuvchi", "uz-cyrl": "Сотувчи", ru: "Продавец" },
    company: "Chorsu Market",
    location: {
      uz: "Toshkent, Shayxontohur",
      "uz-cyrl": "Тошкент, Шайхонтоҳур",
      ru: "Ташкент, Шайхантахур",
    },
    salaryMin: 4_000_000,
    salaryMax: 6_000_000,
    postedMinutesAgo: 120,
    fastReply: true,
    verified: true,
  },
  {
    id: "s2",
    title: { uz: "Oshpaz", "uz-cyrl": "Ошпаз", ru: "Повар" },
    company: "Milano Cafe",
    location: {
      uz: "Toshkent, Yunusobod",
      "uz-cyrl": "Тошкент, Юнусобод",
      ru: "Ташкент, Юнусабад",
    },
    salaryMin: 5_000_000,
    salaryMax: 7_000_000,
    postedMinutesAgo: 300,
    fastReply: false,
    verified: true,
  },
  {
    id: "s3",
    title: { uz: "Kuryer", "uz-cyrl": "Курьер", ru: "Курьер" },
    company: "Express Yetkazib",
    location: { uz: "Toshkent", "uz-cyrl": "Тошкент", ru: "Ташкент" },
    salaryMin: 6_000_000,
    salaryMax: 9_000_000,
    postedMinutesAgo: 1_500,
    fastReply: true,
    verified: false,
  },
  {
    id: "s4",
    title: { uz: "Kassir", "uz-cyrl": "Кассир", ru: "Кассир" },
    company: "Korzinka Chilonzor",
    location: {
      uz: "Toshkent, Chilonzor",
      "uz-cyrl": "Тошкент, Чилонзор",
      ru: "Ташкент, Чиланзар",
    },
    salaryMin: 4_500_000,
    salaryMax: null,
    postedMinutesAgo: 1_600,
    fastReply: false,
    verified: false,
  },
];

export const sampleChats: { id: string; company: string; time: string; unread: number; message: Localized }[] = [
  {
    id: "c1",
    company: "Chorsu Market",
    time: "14:32",
    unread: 2,
    message: {
      uz: "Ertaga soat 10 da kela olasizmi?",
      "uz-cyrl": "Эртага соат 10 да кела оласизми?",
      ru: "Сможете прийти завтра в 10?",
    },
  },
  {
    id: "c2",
    company: "Milano Cafe",
    time: "11:05",
    unread: 0,
    message: {
      uz: "Kartochkangizni ko'rdik, rahmat",
      "uz-cyrl": "Карточкангизни кўрдик, раҳмат",
      ru: "Посмотрели вашу карточку, спасибо",
    },
  },
  {
    id: "c3",
    company: "Express Yetkazib",
    time: "09:41",
    unread: 0,
    message: {
      uz: "Ish vaqti 9:00 dan 18:00 gacha",
      "uz-cyrl": "Иш вақти 9:00 дан 18:00 гача",
      ru: "График с 9:00 до 18:00",
    },
  },
];

export const sampleSearches: Localized[] = [
  { uz: "sotuvchi Chorsu", "uz-cyrl": "сотувчи Чорсу", ru: "продавец Чорсу" },
  { uz: "kuryer smenali", "uz-cyrl": "курьер сменали", ru: "курьер посменно" },
  { uz: "oshpaz Yunusobod", "uz-cyrl": "ошпаз Юнусобод", ru: "повар Юнусабад" },
];
