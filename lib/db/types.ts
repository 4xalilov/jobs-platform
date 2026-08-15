import type { Locale } from "@/lib/i18n";

/**
 * API javoblari uchun tiplar.
 * Bazada ustun nomlari o'zbekcha (spetsifikatsiyadagidek), bu yerda esa
 * frontend uchun qulay ingliz nomlari — moslashtirish so'rovlarda bo'ladi.
 */
export type Localized = Record<Locale, string>;

export type ExperienceLevel = "none" | "upToOne" | "oneToThree" | "threePlus";

/** v4: "daily" va "online" qo'shildi — kanal ichidagi chip qatori shular */
export type EmploymentType = "full" | "part" | "shift" | "temporary" | "daily" | "online";

/** Chip qatorining tartibi (§2). "Hammasi" alohida, ro'yxatda emas. */
export const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full",
  "daily",
  "online",
  "part",
  "shift",
  "temporary",
];

/* ——— Kanallar (v4, 1-bo'lim) ——— */

/** Kanal ro'yxatidagi bitta qator — Telegram chat list'ining aynan o'zi */
export type ChannelListItemDTO = {
  id: string;
  name: Localized;
  group: string;
  subscribed: boolean;
  muted: boolean;
  pinned: boolean;
  /** Oxirgi kirgandan keyin qo'shilgan vakansiyalar — qatordagi belgi */
  newCount: number;
  vacancyCount: number;
  subscriberCount: number;
  /** Izoh qatori: kanaldagi eng oxirgi vakansiya */
  last: {
    title: string;
    company: string;
    salaryMin: number | null;
    salaryMax: number | null;
    minutesAgo: number;
  } | null;
};

/** Katalog: kanallar kasb guruhlari bo'yicha ajratilgan */
export type ChannelGroupDTO = {
  id: string;
  channels: ChannelListItemDTO[];
};

/** Kanal ichi — sarlavha uchun */
export type ChannelDTO = {
  id: string;
  name: Localized;
  group: string;
  subscribed: boolean;
  muted: boolean;
  pinned: boolean;
  subscriberCount: number;
  vacancyCount: number;
  /** Chip qatoridagi sonlar: To'liq kun 24 */
  employmentCounts: Partial<Record<EmploymentType, number>>;
};

/**
 * Vakansiya talablari — erkin matn emas, ro'yxatdan tanlanadi.
 * Bazada kalit saqlanadi, matni tarjimadan olinadi.
 */
export const REQUIREMENT_KEYS = [
  "noExperience",
  "passport",
  "medicalBook",
  "drivingLicence",
  "ownTransport",
  "russian",
  "english",
  "computer",
  "cashRegister",
  "physical",
  "nightShift",
  "adult",
] as const;

export type RequirementKey = (typeof REQUIREMENT_KEYS)[number];

/**
 * Moslik — foiz emas, ro'yxat. Foiz ishonchni yo'qotadi, ro'yxat esa
 * harakatga aylanadi: nima yetishmasa, nima qilish kerakligi yoziladi.
 */
export type MatchCriterion = "profession" | "city" | "experience" | "employment";

export type MatchItem = {
  key: MatchCriterion;
  ok: boolean;
  /** Vakansiya nimani kutadi */
  required: string;
  /** Nomzodda nima bor — mos kelmasa ko'rsatiladi */
  mine: string | null;
};

export type MatchDTO = {
  items: MatchItem[];
  matched: number;
  total: number;
};

/** Ish beruvchining javob berish odati — Telegram kanalida bunday ma'lumot yo'q */
export type ResponseStatsDTO = {
  /** Arizalarning necha foiziga javob bergan; ariza bo'lmasa null */
  rate: number | null;
  /** O'rtacha javob vaqti, soatlarda */
  averageHours: number | null;
  /** Oxirgi faollikdan beri o'tgan kun; hech qachon bo'lmasa null */
  lastActiveDays: number | null;
  applications: number;
};
export type PlanId = "free" | "standard" | "premium" | "pack" | "database";
export type VacancyStatus = "faol" | "tugagan" | "yopilgan";

export type ProfessionDTO = { id: string; name: Localized; category: string };

export type DistrictDTO = { id: string; name: Localized };
export type CityDTO = { id: string; name: Localized; districts: DistrictDTO[] };

export type VacancyDTO = {
  id: string;
  title: string;
  professionId: string | null;
  professionName: Localized | null;
  company: string;
  verified: boolean;
  fastReply: boolean;
  cityName: Localized | null;
  districtName: Localized | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: ExperienceLevel;
  employment: EmploymentType;
  description: string;
  requirements: RequirementKey[];
  postedMinutesAgo: number;
  views: number;
  applications: number;
  /** Foydalanuvchi joylashuvi berilganda hisoblanadi */
  distanceKm: number | null;
  saved: boolean;
  applied: boolean;
  /** Ish beruvchi shoshilinch deb belgilagan — sariq chip (§4.2) */
  urgent: boolean;
  /** Kirgan nomzod uchun hisoblanadi */
  match: MatchDTO | null;
  responseStats: ResponseStatsDTO;
};

export type Page<T> = { items: T[]; cursor: string | null };

export type ChatListItemDTO = {
  id: string;
  company: string;
  fastReply: boolean;
  professionName: Localized | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};

export type ChatSide = "nomzod" | "ish_beruvchi";

export type MessageDTO = {
  id: string;
  from: ChatSide | "tizim";
  text: string;
  /** Ko'rsatish uchun tayyor soat: 14:32 */
  time: string;
  /** ISO — sana ajratgichlari va tartib uchun */
  at: string;
  /** Qarshi tomon o'qiganmi (ikkita belgi) */
  read: boolean;
  /** Ovozli xabar bo'lsa */
  audioUrl?: string;
  durationMs?: number;
};

export type ChatDTO = {
  id: string;
  title: string;
  fastReply: boolean;
  professionName: Localized | null;
  messages: MessageDTO[];
};

/** Chatni davomli kuzatish javobi */
export type ChatUpdateDTO = {
  messages: MessageDTO[];
  /** Shu vaqtgacha yuborgan xabarlarim o'qilgan (ISO) */
  readUpTo: string | null;
};

export type CardDTO = {
  id: string | null;
  /** "Ish qidiryapman" — yoqilsa ish beruvchilar ro'yxatida ko'rinadi */
  openToWork: boolean;
  visibility: "hamma" | "ish_beruvchilar";
  name: string;
  professionId: string | null;
  cityId: string | null;
  districtId: string | null;
  experience: ExperienceLevel;
  /** v2 ning 5-maydoni — kutilayotgan maosh o'rniga */
  employment: EmploymentType;
  photoUrl: string | null;
  voiceUrl: string | null;
};

/** Arizalarim ekranidagi bitta ariza */
export type ApplicationDTO = {
  id: string;
  chatId: string | null;
  company: string;
  vacancyTitle: string;
  professionName: Localized | null;
  cityName: Localized | null;
  status: ApplicationStatus;
  sentAt: string;
  sentLabel: string;
  /** To'rt bosqichning har biri: bo'lgan bo'lsa vaqti bilan */
  chain: { step: ApplicationStatus; at: string | null }[];
  /** Ish beruvchi 7 kundan beri ko'rmagan */
  stale: boolean;
  /** Javob bo'lmasa taklif qilinadigan o'xshash vakansiyalar */
  similar: { id: string; title: string; company: string }[];
};

export type ApplicationStatus = "yuborildi" | "korildi" | "korib_chiqilmoqda" | "javob_berildi";

export type EmployerVacancyDTO = {
  id: string;
  title: string;
  professionName: Localized | null;
  cityName: Localized | null;
  districtName: Localized | null;
  salaryMin: number | null;
  salaryMax: number | null;
  employment: EmploymentType;
  description: string;
  status: VacancyStatus;
  plan: PlanId;
  views: number;
  applications: number;
  newApplications: number;
  postedMinutesAgo: number;
  daysLeft: number;
};

export type CandidateDTO = {
  id: string;
  applicationId: string;
  chatId: string;
  name: string;
  professionName: Localized | null;
  cityName: Localized | null;
  districtName: Localized | null;
  experience: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  vacancyTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};

export type CompanyDTO = {
  id: string;
  name: string;
  phone: string | null;
  about: string | null;
  verified: boolean;
  fastReply: boolean;
};
