import type { Locale } from "@/lib/i18n";

/**
 * Shartli ma'lumotlar — 2-bosqichda ekranlarni to'ldirish uchun.
 * 4-bosqichda bazadan keladi (professions.nom_uz / nom_ru ustunlari kabi).
 */
export type Localized = Record<Locale, string>;

export type ExperienceLevel = "none" | "upToOne" | "oneToThree" | "threePlus";
export type EmploymentType = "full" | "part" | "shift" | "temporary";

export type Profession = { id: string; name: Localized };

export const professions: Profession[] = [
  { id: "sotuvchi", name: { uz: "Sotuvchi", "uz-cyrl": "Сотувчи", ru: "Продавец" } },
  { id: "kassir", name: { uz: "Kassir", "uz-cyrl": "Кассир", ru: "Кассир" } },
  { id: "oshpaz", name: { uz: "Oshpaz", "uz-cyrl": "Ошпаз", ru: "Повар" } },
  { id: "ofitsiant", name: { uz: "Ofitsiant", "uz-cyrl": "Официант", ru: "Официант" } },
  { id: "barmen", name: { uz: "Barmen", "uz-cyrl": "Бармен", ru: "Бармен" } },
  { id: "kuryer", name: { uz: "Kuryer", "uz-cyrl": "Курьер", ru: "Курьер" } },
  { id: "haydovchi", name: { uz: "Haydovchi", "uz-cyrl": "Ҳайдовчи", ru: "Водитель" } },
  { id: "omborchi", name: { uz: "Omborchi", "uz-cyrl": "Омборчи", ru: "Кладовщик" } },
  { id: "administrator", name: { uz: "Administrator", "uz-cyrl": "Администратор", ru: "Администратор" } },
  { id: "farrosh", name: { uz: "Farrosh", "uz-cyrl": "Фаррош", ru: "Уборщик" } },
  { id: "sartarosh", name: { uz: "Sartarosh", "uz-cyrl": "Сартарош", ru: "Парикмахер" } },
  { id: "quruvchi", name: { uz: "Quruvchi", "uz-cyrl": "Қурувчи", ru: "Строитель" } },
  { id: "qorovul", name: { uz: "Qorovul", "uz-cyrl": "Қоровул", ru: "Охранник" } },
  { id: "tikuvchi", name: { uz: "Tikuvchi", "uz-cyrl": "Тикувчи", ru: "Швея" } },
];

export type City = { id: string; name: Localized; districts: Localized[] };

const tashkentDistricts: Localized[] = [
  { uz: "Chilonzor", "uz-cyrl": "Чилонзор", ru: "Чиланзар" },
  { uz: "Yunusobod", "uz-cyrl": "Юнусобод", ru: "Юнусабад" },
  { uz: "Mirzo Ulug'bek", "uz-cyrl": "Мирзо Улуғбек", ru: "Мирзо-Улугбек" },
  { uz: "Shayxontohur", "uz-cyrl": "Шайхонтоҳур", ru: "Шайхантахур" },
  { uz: "Yakkasaroy", "uz-cyrl": "Яккасарой", ru: "Яккасарай" },
  { uz: "Olmazor", "uz-cyrl": "Олмазор", ru: "Алмазар" },
  { uz: "Sergeli", "uz-cyrl": "Сергели", ru: "Сергели" },
  { uz: "Uchtepa", "uz-cyrl": "Учтепа", ru: "Учтепа" },
  { uz: "Mirobod", "uz-cyrl": "Миробод", ru: "Мирабад" },
  { uz: "Yashnobod", "uz-cyrl": "Яшнобод", ru: "Яшнабад" },
];

export const cities: City[] = [
  { id: "toshkent", name: { uz: "Toshkent", "uz-cyrl": "Тошкент", ru: "Ташкент" }, districts: tashkentDistricts },
  { id: "samarqand", name: { uz: "Samarqand", "uz-cyrl": "Самарқанд", ru: "Самарканд" }, districts: [] },
  { id: "buxoro", name: { uz: "Buxoro", "uz-cyrl": "Бухоро", ru: "Бухара" }, districts: [] },
  { id: "andijon", name: { uz: "Andijon", "uz-cyrl": "Андижон", ru: "Андижан" }, districts: [] },
  { id: "fargona", name: { uz: "Farg'ona", "uz-cyrl": "Фарғона", ru: "Фергана" }, districts: [] },
  { id: "namangan", name: { uz: "Namangan", "uz-cyrl": "Наманган", ru: "Наманган" }, districts: [] },
  { id: "nukus", name: { uz: "Nukus", "uz-cyrl": "Нукус", ru: "Нукус" }, districts: [] },
];

/** Kompaniya turi — qaysi kasblar mos kelishini belgilaydi */
type CompanyKind = "market" | "cafe" | "logistics" | "salon" | "construction" | "workshop" | "taxi";

const KIND_PROFESSIONS: Record<CompanyKind, string[]> = {
  market: ["sotuvchi", "kassir", "omborchi", "farrosh", "qorovul", "administrator"],
  cafe: ["oshpaz", "ofitsiant", "barmen", "farrosh", "administrator", "kassir"],
  logistics: ["kuryer", "haydovchi", "omborchi", "qorovul"],
  salon: ["sartarosh", "administrator", "farrosh"],
  construction: ["quruvchi", "qorovul", "haydovchi"],
  workshop: ["tikuvchi", "omborchi", "farrosh"],
  taxi: ["haydovchi", "kuryer", "administrator"],
};

/**
 * Har bir kompaniya o'z shahri va turiga ega — shunda "Sartarosh · Express
 * Yetkazib" yoki "Toshkent Taxi · Nukus" kabi holat chiqmaydi.
 */
const companies: { name: string; cityId: string; kind: CompanyKind }[] = [
  { name: "Chorsu Market", cityId: "toshkent", kind: "market" },
  { name: "Milano Cafe", cityId: "toshkent", kind: "cafe" },
  { name: "Express Yetkazib", cityId: "toshkent", kind: "logistics" },
  { name: "Korzinka Chilonzor", cityId: "toshkent", kind: "market" },
  { name: "Havas Market", cityId: "toshkent", kind: "market" },
  { name: "Oqtepa Lavash", cityId: "toshkent", kind: "cafe" },
  { name: "Bek Pizza", cityId: "toshkent", kind: "cafe" },
  { name: "Makro Yunusobod", cityId: "toshkent", kind: "market" },
  { name: "Anhor Logistics", cityId: "toshkent", kind: "logistics" },
  { name: "Sim Sim Coffee", cityId: "toshkent", kind: "cafe" },
  { name: "Nur Qurilish", cityId: "toshkent", kind: "construction" },
  { name: "Diyor Ombor", cityId: "toshkent", kind: "logistics" },
  { name: "City Barbershop", cityId: "toshkent", kind: "salon" },
  { name: "Zamon Market", cityId: "toshkent", kind: "market" },
  { name: "Toshkent Taxi", cityId: "toshkent", kind: "taxi" },
  { name: "Registon Restoran", cityId: "samarqand", kind: "cafe" },
  { name: "Safiya Salon", cityId: "samarqand", kind: "salon" },
  { name: "Bahor Tikuvchilik", cityId: "buxoro", kind: "workshop" },
  { name: "Sharq Baraka", cityId: "andijon", kind: "market" },
  { name: "Yulduz Kafe", cityId: "fargona", kind: "cafe" },
];

/**
 * Qisqa tavsiflar — vakansiya sheetida ko'rsatiladi.
 * Har bir tavsif o'z bandlik turi va (ba'zan) tajriba talabini olib yuradi,
 * shunda belgilar matnga zid kelmaydi.
 */
const descriptions: {
  text: Localized;
  employment: EmploymentType;
  experience?: ExperienceLevel;
}[] = [
  {
    employment: "full",
    experience: "none",
    text: {
      uz: "Ishga xodim kerak. Ish vaqti 9:00–18:00, dam olish kuni — yakshanba. Tajriba shart emas, o'rgatamiz.",
      "uz-cyrl": "Ишга ходим керак. Иш вақти 9:00–18:00, дам олиш куни — якшанба. Тажриба шарт эмас, ўргатамиз.",
      ru: "Нужен сотрудник. График 9:00–18:00, выходной — воскресенье. Опыт не обязателен, научим.",
    },
  },
  {
    employment: "shift",
    text: {
      uz: "Smenali ish: 2 kun ishlaysiz, 2 kun dam olasiz. Ovqat va forma bepul. Maosh har oyning 5-sanasida.",
      "uz-cyrl": "Сменали иш: 2 кун ишлайсиз, 2 кун дам оласиз. Овқат ва форма бепул. Маош ҳар ойнинг 5-санасида.",
      ru: "Посменно: 2 дня работаете, 2 отдыхаете. Питание и форма бесплатно. Зарплата 5-го числа каждого месяца.",
    },
  },
  {
    employment: "full",
    text: {
      uz: "Jamoamizga mas'uliyatli xodim qidiryapmiz. Ish joyi metro yaqinida. Sinov muddati 7 kun.",
      "uz-cyrl": "Жамоамизга масъулиятли ходим қидиряпмиз. Иш жойи метро яқинида. Синов муддати 7 кун.",
      ru: "Ищем ответственного сотрудника в команду. Работа рядом с метро. Испытательный срок 7 дней.",
    },
  },
  {
    employment: "part",
    experience: "none",
    text: {
      uz: "Yarim kun ish. Tajribasiz ham bo'ladi — birinchi hafta o'rgatamiz. Maosh har hafta.",
      "uz-cyrl": "Ярим кун иш. Тажрибасиз ҳам бўлади — биринчи ҳафта ўргатамиз. Маош ҳар ҳафта.",
      ru: "Неполный день. Можно без опыта — обучим в первую неделю. Зарплата еженедельно.",
    },
  },
  {
    employment: "full",
    text: {
      uz: "To'liq kun ish. Rasmiy ishga joylashtiramiz. Tushlik va yo'l puli kompaniya hisobidan.",
      "uz-cyrl": "Тўлиқ кун иш. Расмий ишга жойлаштирамиз. Тушлик ва йўл пули компания ҳисобидан.",
      ru: "Полный день. Оформляем официально. Обед и проезд за счёт компании.",
    },
  },
  {
    employment: "shift",
    text: {
      uz: "Kechki smenaga xodim kerak: 15:00–23:00. Uyga yetkazib qo'yamiz. Kunlik to'lov ham mumkin.",
      "uz-cyrl": "Кечки сменага ходим керак: 15:00–23:00. Уйга етказиб қўямиз. Кунлик тўлов ҳам мумкин.",
      ru: "Нужен сотрудник в вечернюю смену: 15:00–23:00. Развозим по домам. Возможна ежедневная оплата.",
    },
  },
  {
    employment: "full",
    experience: "threePlus",
    text: {
      uz: "Tajribali xodim kerak — kamida 3 yil. Maosh natijaga qarab oshadi. Jamoa yosh va do'stona.",
      "uz-cyrl": "Тажрибали ходим керак — камида 3 йил. Маош натижага қараб ошади. Жамоа ёш ва дўстона.",
      ru: "Нужен опытный сотрудник — от 3 лет. Зарплата растёт по результату. Коллектив молодой и дружный.",
    },
  },
  {
    employment: "temporary",
    experience: "none",
    text: {
      uz: "Vaqtinchalik ish — 1 oyga. Kunlik to'lov. Ish vaqti moslashuvchan, o'qish bilan birga bo'ladi.",
      "uz-cyrl": "Вақтинчалик иш — 1 ойга. Кунлик тўлов. Иш вақти мослашувчан, ўқиш билан бирга бўлади.",
      ru: "Временная работа — на 1 месяц. Оплата ежедневно. График гибкий, совместимо с учёбой.",
    },
  },
];

export type Vacancy = {
  id: string;
  professionId: string;
  company: string;
  cityId: string;
  district: Localized | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: ExperienceLevel;
  employment: EmploymentType;
  description: Localized;
  /** Necha daqiqa oldin joylashtirilgan */
  postedMinutesAgo: number;
  fastReply: boolean;
  verified: boolean;
  views: number;
  applications: number;
  /** Foydalanuvchidan masofa, km */
  distanceKm: number;
};

/** Turg'un tasodifiy — har safar bir xil ro'yxat chiqadi (server va mijozda ham) */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildVacancies(count: number): Vacancy[] {
  const rand = seeded(20260809);
  const openExperiences: ExperienceLevel[] = ["upToOne", "oneToThree"];
  const list: Vacancy[] = [];

  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(rand() * companies.length)];
    const candidates = KIND_PROFESSIONS[company.kind];
    const professionId = candidates[Math.floor(rand() * candidates.length)];
    const city = cityById(company.cityId) ?? cities[0];
    const district =
      city.districts.length > 0
        ? city.districts[Math.floor(rand() * city.districts.length)]
        : null;

    const description = descriptions[Math.floor(rand() * descriptions.length)];
    const base = 3_000_000 + Math.floor(rand() * 6) * 500_000;
    const hasRange = rand() < 0.75;
    const negotiable = rand() < 0.08;

    list.push({
      id: `v${i + 1}`,
      professionId,
      company: company.name,
      cityId: city.id,
      district,
      salaryMin: negotiable ? null : base,
      salaryMax: negotiable ? null : hasRange ? base + 1_000_000 + Math.floor(rand() * 4) * 500_000 : null,
      experience:
        description.experience ?? openExperiences[Math.floor(rand() * openExperiences.length)],
      employment: description.employment,
      description: description.text,
      postedMinutesAgo: Math.floor(rand() * 5_000),
      fastReply: rand() < 0.35,
      verified: rand() < 0.45,
      views: 20 + Math.floor(rand() * 900),
      applications: Math.floor(rand() * 40),
      // Masofa shaharga bog'liq — boshqa shaharlar tabiiy ravishda oxirida qoladi
      distanceKm:
        city.id === "toshkent"
          ? Math.round((0.3 + rand() * 14.7) * 10) / 10
          : 180 + Math.floor(rand() * 420),
    });
  }

  // Yangi vakansiyalar tepada
  return list.sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
}

export const vacancies: Vacancy[] = buildVacancies(48);

export function vacancyById(id: string): Vacancy | undefined {
  return vacancies.find((v) => v.id === id);
}

export function professionById(id: string): Profession | undefined {
  return professions.find((p) => p.id === id);
}

export function cityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

/** Vakansiya joylashuvi: "Toshkent, Chilonzor" */
export function vacancyLocation(vacancy: Vacancy, locale: Locale): string {
  const city = cityById(vacancy.cityId);
  const cityName = city ? city.name[locale] : "";
  return vacancy.district ? `${cityName}, ${vacancy.district[locale]}` : cityName;
}

/* ——— Chatlar ——— */

export type ChatMessage = {
  id: string;
  from: "employer" | "candidate" | "system";
  text: Localized;
  time: string;
};

export type Chat = {
  id: string;
  /** Qaysi vakansiya bo'yicha ariza yuborilgan */
  professionId: string;
  company: string;
  fastReply: boolean;
  time: string;
  unread: number;
  messages: ChatMessage[];
};

export const chats: Chat[] = [
  {
    id: "c1",
    professionId: "sotuvchi",
    company: "Chorsu Market",
    fastReply: true,
    time: "14:32",
    unread: 2,
    messages: [
      {
        id: "m1",
        from: "system",
        time: "12:10",
        text: {
          uz: "Siz ariza yubordingiz",
          "uz-cyrl": "Сиз ариза юбордингиз",
          ru: "Вы отправили отклик",
        },
      },
      {
        id: "m2",
        from: "employer",
        time: "12:41",
        text: {
          uz: "Assalomu alaykum! Kartochkangizni ko'rdik.",
          "uz-cyrl": "Ассалому алайкум! Карточкангизни кўрдик.",
          ru: "Здравствуйте! Посмотрели вашу карточку.",
        },
      },
      {
        id: "m3",
        from: "candidate",
        time: "13:05",
        text: {
          uz: "Assalomu alaykum, rahmat! Qachon kelay?",
          "uz-cyrl": "Ассалому алайкум, раҳмат! Қачон келай?",
          ru: "Здравствуйте, спасибо! Когда можно подойти?",
        },
      },
      {
        id: "m4",
        from: "employer",
        time: "14:30",
        text: {
          uz: "Ertaga soat 10 da kela olasizmi? Manzil: Chorsu bozori, 2-qator.",
          "uz-cyrl": "Эртага соат 10 да кела оласизми? Манзил: Чорсу бозори, 2-қатор.",
          ru: "Сможете прийти завтра в 10? Адрес: рынок Чорсу, 2-й ряд.",
        },
      },
      {
        id: "m5",
        from: "employer",
        time: "14:32",
        text: {
          uz: "Pasport nusxasini olib keling.",
          "uz-cyrl": "Паспорт нусхасини олиб келинг.",
          ru: "Возьмите с собой копию паспорта.",
        },
      },
    ],
  },
  {
    id: "c2",
    professionId: "oshpaz",
    company: "Milano Cafe",
    fastReply: false,
    time: "11:05",
    unread: 0,
    messages: [
      {
        id: "m1",
        from: "system",
        time: "10:20",
        text: {
          uz: "Siz ariza yubordingiz",
          "uz-cyrl": "Сиз ариза юбордингиз",
          ru: "Вы отправили отклик",
        },
      },
      {
        id: "m2",
        from: "employer",
        time: "11:05",
        text: {
          uz: "Kartochkangizni ko'rdik, rahmat. Bir-ikki kunda javob beramiz.",
          "uz-cyrl": "Карточкангизни кўрдик, раҳмат. Бир-икки кунда жавоб берамиз.",
          ru: "Посмотрели вашу карточку, спасибо. Ответим в течение пары дней.",
        },
      },
    ],
  },
  {
    id: "c3",
    professionId: "kuryer",
    company: "Express Yetkazib",
    fastReply: true,
    time: "09:41",
    unread: 0,
    messages: [
      {
        id: "m1",
        from: "system",
        time: "09:30",
        text: {
          uz: "Siz ariza yubordingiz",
          "uz-cyrl": "Сиз ариза юбордингиз",
          ru: "Вы отправили отклик",
        },
      },
      {
        id: "m2",
        from: "employer",
        time: "09:41",
        text: {
          uz: "Ish vaqti 9:00 dan 18:00 gacha. Moped bormi?",
          "uz-cyrl": "Иш вақти 9:00 дан 18:00 гача. Мопед борми?",
          ru: "График с 9:00 до 18:00. Мопед есть?",
        },
      },
    ],
  },
];

export function chatById(id: string): Chat | undefined {
  return chats.find((c) => c.id === id);
}

/* ——— Nomzod kartochkasi ——— */

export type CandidateCard = {
  name: string;
  professionId: string | null;
  cityId: string | null;
  districtIndex: number | null;
  experience: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
};

export const defaultCard: CandidateCard = {
  name: "Aziz",
  professionId: "sotuvchi",
  cityId: "toshkent",
  districtIndex: 0,
  experience: "upToOne",
  salaryMin: 4_000_000,
  salaryMax: 6_000_000,
};

/** Maosh diapazoni tanlovi — yozilmaydi, ro'yxatdan tanlanadi */
export const salaryRanges: { min: number | null; max: number | null }[] = [
  { min: null, max: null },
  { min: 2_000_000, max: 3_000_000 },
  { min: 3_000_000, max: 4_000_000 },
  { min: 4_000_000, max: 6_000_000 },
  { min: 6_000_000, max: 8_000_000 },
  { min: 8_000_000, max: 12_000_000 },
  { min: 12_000_000, max: null },
];

export const recentSearches: Localized[] = [
  { uz: "sotuvchi Chorsu", "uz-cyrl": "сотувчи Чорсу", ru: "продавец Чорсу" },
  { uz: "kuryer smenali", "uz-cyrl": "курьер сменали", ru: "курьер посменно" },
  { uz: "oshpaz Yunusobod", "uz-cyrl": "ошпаз Юнусобод", ru: "повар Юнусабад" },
];
