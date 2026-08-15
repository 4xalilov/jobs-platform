/**
 * Namunaviy ma'lumotlar.
 *
 * Generator turg'un urug'dan foydalanadi — har safar bir xil 180 ta
 * vakansiya chiqadi, shuning uchun skrinshot va testlar ham barqaror.
 *
 * Ishga tushirish:  npm run db:seed
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { failWith } from "./explain-error.mjs";
import { sslFor } from "./ssl.mjs";

const here = dirname(fileURLToPath(import.meta.url));

/* ——— Ma'lumotnomalar ——— */

const CITIES = [
  { id: "toshkent", uz: "Toshkent", cyrl: "Тошкент", ru: "Ташкент", lat: 41.3111, lng: 69.2406 },
  {
    id: "samarqand",
    uz: "Samarqand",
    cyrl: "Самарқанд",
    ru: "Самарканд",
    lat: 39.627,
    lng: 66.975,
  },
  { id: "buxoro", uz: "Buxoro", cyrl: "Бухоро", ru: "Бухара", lat: 39.768, lng: 64.421 },
  { id: "andijon", uz: "Andijon", cyrl: "Андижон", ru: "Андижан", lat: 40.783, lng: 72.344 },
  { id: "fargona", uz: "Farg'ona", cyrl: "Фарғона", ru: "Фергана", lat: 40.386, lng: 71.787 },
  { id: "namangan", uz: "Namangan", cyrl: "Наманган", ru: "Наманган", lat: 40.998, lng: 71.672 },
  { id: "nukus", uz: "Nukus", cyrl: "Нукус", ru: "Нукус", lat: 42.453, lng: 59.61 },
];

const DISTRICTS = [
  { id: "chilonzor", uz: "Chilonzor", cyrl: "Чилонзор", ru: "Чиланзар", lat: 41.275, lng: 69.205 },
  { id: "yunusobod", uz: "Yunusobod", cyrl: "Юнусобод", ru: "Юнусабад", lat: 41.36, lng: 69.29 },
  {
    id: "mirzo-ulugbek",
    uz: "Mirzo Ulug'bek",
    cyrl: "Мирзо Улуғбек",
    ru: "Мирзо-Улугбек",
    lat: 41.33,
    lng: 69.34,
  },
  {
    id: "shayxontohur",
    uz: "Shayxontohur",
    cyrl: "Шайхонтоҳур",
    ru: "Шайхантахур",
    lat: 41.32,
    lng: 69.23,
  },
  {
    id: "yakkasaroy",
    uz: "Yakkasaroy",
    cyrl: "Яккасарой",
    ru: "Яккасарай",
    lat: 41.287,
    lng: 69.256,
  },
  { id: "olmazor", uz: "Olmazor", cyrl: "Олмазор", ru: "Алмазар", lat: 41.35, lng: 69.21 },
  { id: "sergeli", uz: "Sergeli", cyrl: "Сергели", ru: "Сергели", lat: 41.22, lng: 69.22 },
  { id: "uchtepa", uz: "Uchtepa", cyrl: "Учтепа", ru: "Учтепа", lat: 41.295, lng: 69.17 },
  { id: "mirobod", uz: "Mirobod", cyrl: "Миробод", ru: "Мирабад", lat: 41.29, lng: 69.29 },
  { id: "yashnobod", uz: "Yashnobod", cyrl: "Яшнобод", ru: "Яшнабад", lat: 41.295, lng: 69.33 },
];

const PROFESSIONS = [
  { id: "sotuvchi", uz: "Sotuvchi", cyrl: "Сотувчи", ru: "Продавец", kat: "savdo" },
  { id: "kassir", uz: "Kassir", cyrl: "Кассир", ru: "Кассир", kat: "savdo" },
  { id: "oshpaz", uz: "Oshpaz", cyrl: "Ошпаз", ru: "Повар", kat: "ovqatlanish" },
  { id: "ofitsiant", uz: "Ofitsiant", cyrl: "Официант", ru: "Официант", kat: "ovqatlanish" },
  { id: "barmen", uz: "Barmen", cyrl: "Бармен", ru: "Бармен", kat: "ovqatlanish" },
  { id: "kuryer", uz: "Kuryer", cyrl: "Курьер", ru: "Курьер", kat: "logistika" },
  { id: "haydovchi", uz: "Haydovchi", cyrl: "Ҳайдовчи", ru: "Водитель", kat: "logistika" },
  { id: "omborchi", uz: "Omborchi", cyrl: "Омборчи", ru: "Кладовщик", kat: "logistika" },
  {
    id: "administrator",
    uz: "Administrator",
    cyrl: "Администратор",
    ru: "Администратор",
    kat: "xizmat",
  },
  { id: "farrosh", uz: "Farrosh", cyrl: "Фаррош", ru: "Уборщик", kat: "xizmat" },
  { id: "sartarosh", uz: "Sartarosh", cyrl: "Сартарош", ru: "Парикмахер", kat: "xizmat" },
  { id: "quruvchi", uz: "Quruvchi", cyrl: "Қурувчи", ru: "Строитель", kat: "qurilish" },
  { id: "elektrik", uz: "Elektrik", cyrl: "Электрик", ru: "Электрик", kat: "qurilish" },
  { id: "payvandchi", uz: "Payvandchi", cyrl: "Пайвандчи", ru: "Сварщик", kat: "qurilish" },
  { id: "usta", uz: "Usta", cyrl: "Уста", ru: "Мастер", kat: "xizmat" },
  { id: "qorovul", uz: "Qorovul", cyrl: "Қоровул", ru: "Охранник", kat: "xavfsizlik" },
  { id: "tikuvchi", uz: "Tikuvchi", cyrl: "Тикувчи", ru: "Швея", kat: "ishlab_chiqarish" },
  { id: "oqituvchi", uz: "O'qituvchi", cyrl: "Ўқитувчи", ru: "Учитель", kat: "talim" },
  { id: "tarbiyachi", uz: "Tarbiyachi", cyrl: "Тарбиячи", ru: "Воспитатель", kat: "talim" },
  { id: "hamshira", uz: "Hamshira", cyrl: "Ҳамшира", ru: "Медсестра", kat: "tibbiyot" },
  { id: "dasturchi", uz: "Dasturchi", cyrl: "Дастурчи", ru: "Программист", kat: "it" },
  { id: "smm", uz: "SMM mutaxassisi", cyrl: "SMM мутахассиси", ru: "SMM-специалист", kat: "it" },
];

/**
 * Kanallar. Deyarli hammasi kasbdan kelib chiqadi (§1.3: kanal = kasb).
 * Bitta istisno — "Kunlik ishlar": u bandlik turi bo'yicha yig'iladi,
 * chunki mardikorlik va smenali yordam O'zbekistonda katta segment va
 * bironta platforma uni normal qamramagan.
 */
const CHANNELS = [
  ...PROFESSIONS.map((p) => ({ id: p.id, uz: p.uz, cyrl: p.cyrl, ru: p.ru, guruh: p.kat })),
  {
    id: "kunlik",
    uz: "Kunlik ishlar",
    cyrl: "Кунлик ишлар",
    ru: "Подённая работа",
    guruh: "kunlik",
    bandlik: "daily",
  },
];

/**
 * Kompaniya turiga mos kasblar, vazn bilan: takrorlangan kasb ko'proq
 * uchraydi. Aks holda ro'yxatda farrosh sotuvchidan ko'p chiqib qoladi.
 */
/** Kasbga mos keladigan talablar — tasodifiy emas, mantiqli */
const PROFESSION_REQUIREMENTS = {
  sotuvchi: ["noExperience", "passport", "cashRegister"],
  kassir: ["cashRegister", "passport", "computer"],
  oshpaz: ["medicalBook", "passport", "nightShift"],
  ofitsiant: ["medicalBook", "noExperience", "russian"],
  haydovchi: ["drivingLicence", "ownTransport", "adult"],
  kuryer: ["ownTransport", "adult", "passport"],
  omborchi: ["physical", "passport", "adult"],
  farrosh: ["noExperience", "physical", "passport"],
  qorovul: ["nightShift", "adult", "passport"],
  sartarosh: ["noExperience", "passport", "russian"],
  administrator: ["computer", "russian", "passport"],
  usta: ["physical", "passport", "adult"],
  barmen: ["medicalBook", "noExperience", "adult"],
  quruvchi: ["physical", "adult", "passport"],
  elektrik: ["physical", "adult", "passport"],
  payvandchi: ["physical", "adult", "passport"],
  tikuvchi: ["noExperience", "physical", "passport"],
  oqituvchi: ["computer", "passport", "russian"],
  tarbiyachi: ["medicalBook", "passport", "noExperience"],
  hamshira: ["medicalBook", "passport", "adult"],
  dasturchi: ["computer", "russian"],
  smm: ["computer", "russian", "noExperience"],
};

const KIND_PROFESSIONS = {
  market: [
    "sotuvchi",
    "sotuvchi",
    "sotuvchi",
    "sotuvchi",
    "kassir",
    "kassir",
    "kassir",
    "omborchi",
    "omborchi",
    "administrator",
    "qorovul",
    "farrosh",
  ],
  cafe: [
    "oshpaz",
    "oshpaz",
    "oshpaz",
    "ofitsiant",
    "ofitsiant",
    "ofitsiant",
    "barmen",
    "barmen",
    "kassir",
    "administrator",
    "farrosh",
  ],
  logistics: [
    "kuryer",
    "kuryer",
    "kuryer",
    "kuryer",
    "haydovchi",
    "haydovchi",
    "haydovchi",
    "omborchi",
    "omborchi",
    "qorovul",
  ],
  salon: ["sartarosh", "sartarosh", "sartarosh", "sartarosh", "administrator", "farrosh"],
  construction: [
    "quruvchi",
    "quruvchi",
    "quruvchi",
    "elektrik",
    "elektrik",
    "payvandchi",
    "payvandchi",
    "usta",
    "qorovul",
    "haydovchi",
  ],
  workshop: ["tikuvchi", "tikuvchi", "tikuvchi", "tikuvchi", "omborchi", "farrosh"],
  taxi: ["haydovchi", "haydovchi", "haydovchi", "haydovchi", "kuryer", "kuryer", "administrator"],
  school: [
    "oqituvchi",
    "oqituvchi",
    "oqituvchi",
    "tarbiyachi",
    "tarbiyachi",
    "administrator",
    "farrosh",
  ],
  clinic: ["hamshira", "hamshira", "hamshira", "administrator", "farrosh", "qorovul"],
  it: ["dasturchi", "dasturchi", "dasturchi", "smm", "smm", "administrator"],
  service: ["usta", "usta", "usta", "elektrik", "elektrik", "farrosh"],
};

const COMPANIES = [
  { name: "Chorsu Market", city: "toshkent", kind: "market", verified: true, fast: true },
  { name: "Milano Cafe", city: "toshkent", kind: "cafe", verified: true, fast: false },
  { name: "Express Yetkazib", city: "toshkent", kind: "logistics", verified: false, fast: true },
  { name: "Korzinka Chilonzor", city: "toshkent", kind: "market", verified: true, fast: false },
  { name: "Havas Market", city: "toshkent", kind: "market", verified: true, fast: true },
  { name: "Oqtepa Lavash", city: "toshkent", kind: "cafe", verified: false, fast: true },
  { name: "Bek Pizza", city: "toshkent", kind: "cafe", verified: false, fast: false },
  { name: "Makro Yunusobod", city: "toshkent", kind: "market", verified: true, fast: false },
  { name: "Anhor Logistics", city: "toshkent", kind: "logistics", verified: true, fast: false },
  { name: "Sim Sim Coffee", city: "toshkent", kind: "cafe", verified: false, fast: true },
  { name: "Nur Qurilish", city: "toshkent", kind: "construction", verified: false, fast: false },
  { name: "Diyor Ombor", city: "toshkent", kind: "logistics", verified: false, fast: false },
  { name: "City Barbershop", city: "toshkent", kind: "salon", verified: true, fast: true },
  { name: "Zamon Market", city: "toshkent", kind: "market", verified: true, fast: false },
  { name: "Toshkent Taxi", city: "toshkent", kind: "taxi", verified: false, fast: true },
  { name: "Registon Restoran", city: "samarqand", kind: "cafe", verified: true, fast: false },
  { name: "Safiya Salon", city: "samarqand", kind: "salon", verified: false, fast: false },
  { name: "Bahor Tikuvchilik", city: "buxoro", kind: "workshop", verified: true, fast: true },
  { name: "Sharq Baraka", city: "andijon", kind: "market", verified: false, fast: false },
  { name: "Yulduz Kafe", city: "fargona", kind: "cafe", verified: false, fast: false },
  { name: "Bilim Maktabi", city: "toshkent", kind: "school", verified: true, fast: false },
  { name: "Kelajak Bog'chasi", city: "toshkent", kind: "school", verified: true, fast: true },
  { name: "Shifo Klinika", city: "toshkent", kind: "clinic", verified: true, fast: false },
  { name: "Salomat Med", city: "samarqand", kind: "clinic", verified: false, fast: false },
  { name: "Uzum Tech", city: "toshkent", kind: "it", verified: true, fast: true },
  { name: "Delta Studio", city: "toshkent", kind: "it", verified: false, fast: true },
  { name: "Usta Servis", city: "toshkent", kind: "service", verified: false, fast: false },
  { name: "Mehnat Qurilish", city: "toshkent", kind: "construction", verified: true, fast: false },
  { name: "Buxoro Qurilish", city: "buxoro", kind: "construction", verified: false, fast: false },
  { name: "Namangan Bozor", city: "namangan", kind: "market", verified: false, fast: false },
  { name: "Nukus Savdo", city: "nukus", kind: "market", verified: false, fast: false },
  { name: "Andijon Taxi", city: "andijon", kind: "taxi", verified: false, fast: true },
  { name: "Farg'ona Tikuv", city: "fargona", kind: "workshop", verified: true, fast: false },
  { name: "Oq Saroy Salon", city: "toshkent", kind: "salon", verified: true, fast: false },
];

const DESCRIPTIONS = [
  {
    employment: "full",
    experience: "none",
    text: "Ishga xodim kerak. Ish vaqti 9:00–18:00, dam olish kuni — yakshanba. Tajriba shart emas, o'rgatamiz.",
  },
  {
    employment: "shift",
    experience: null,
    text: "Smenali ish: 2 kun ishlaysiz, 2 kun dam olasiz. Ovqat va forma bepul. Maosh har oyning 5-sanasida.",
  },
  {
    employment: "full",
    experience: null,
    text: "Jamoamizga mas'uliyatli xodim qidiryapmiz. Ish joyi metro yaqinida. Sinov muddati 7 kun.",
  },
  {
    employment: "part",
    experience: "none",
    text: "Yarim kun ish. Tajribasiz ham bo'ladi — birinchi hafta o'rgatamiz. Maosh har hafta.",
  },
  {
    employment: "full",
    experience: null,
    text: "To'liq kun ish. Rasmiy ishga joylashtiramiz. Tushlik va yo'l puli kompaniya hisobidan.",
  },
  {
    employment: "shift",
    experience: null,
    text: "Kechki smenaga xodim kerak: 15:00–23:00. Uyga yetkazib qo'yamiz. Kunlik to'lov ham mumkin.",
  },
  {
    employment: "full",
    experience: "threePlus",
    text: "Tajribali xodim kerak — kamida 3 yil. Maosh natijaga qarab oshadi. Jamoa yosh va do'stona.",
  },
  {
    employment: "temporary",
    experience: "none",
    text: "Vaqtinchalik ish — 1 oyga. Kunlik to'lov. Ish vaqti moslashuvchan, o'qish bilan birga bo'ladi.",
  },
  {
    employment: "daily",
    experience: "none",
    text: "Kunlik ish. To'lov shu kuni, ish tugagach naqd beriladi. Ertalab 8:00 da yig'ilamiz.",
  },
  {
    employment: "daily",
    experience: "none",
    text: "Bir kunlik yordam kerak. Ish 6 soat, to'lov kun oxirida. Tushlik bizdan.",
  },
  {
    employment: "online",
    experience: "upToOne",
    text: "Masofadan ishlash. Ish vaqti moslashuvchan, natija bo'yicha hisob. Internet o'zingizdan.",
  },
];

/** Turg'un tasodifiy (mulberry32) — har safar bir xil, taqsimoti tekis */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL berilmagan. .env.example ga qarang.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, ssl: sslFor(connectionString) });
  await client.connect();

  try {
    await client.query("begin");

    await client.query(`
      truncate messages, chats, applications, saved_vacancies, payments,
               subscriptions, vacancies, candidate_cards, companies, users,
               channels, districts, cities, professions restart identity cascade
    `);

    // Shaharlar va tumanlar
    for (const [index, city] of CITIES.entries()) {
      await client.query(
        "insert into cities (id, nom_uz, nom_uz_cyrl, nom_ru, tartib) values ($1,$2,$3,$4,$5)",
        [city.id, city.uz, city.cyrl, city.ru, index],
      );
    }
    for (const [index, district] of DISTRICTS.entries()) {
      await client.query(
        "insert into districts (id, shahar_id, nom_uz, nom_uz_cyrl, nom_ru, tartib) values ($1,'toshkent',$2,$3,$4,$5)",
        [district.id, district.uz, district.cyrl, district.ru, index],
      );
    }

    // Kasblar
    for (const [index, profession] of PROFESSIONS.entries()) {
      await client.query(
        "insert into professions (id, nom_uz, nom_uz_cyrl, nom_ru, kategoriya, tartib) values ($1,$2,$3,$4,$5,$6)",
        [profession.id, profession.uz, profession.cyrl, profession.ru, profession.kat, index],
      );
    }

    // Kanallar
    for (const [index, channel] of CHANNELS.entries()) {
      await client.query(
        `insert into channels
           (id, nom_uz, nom_uz_cyrl, nom_ru, guruh, kasb_id, filtr_bandlik, tartib, bazaviy_obunachi)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          channel.id,
          channel.uz,
          channel.cyrl,
          channel.ru,
          channel.guruh,
          channel.bandlik ? null : channel.id,
          channel.bandlik ?? null,
          index,
          // Namunaviy obunachi soni — turg'un, kanal tartibidan kelib chiqadi
          400 + ((index * 337) % 1800),
        ],
      );
    }

    // Demo foydalanuvchi — u ham ish qidiradi, ham Chorsu Market egasi.
    // Shunday qilinganda bitta kirish bilan ikkala tomonni ham ko'rish mumkin.
    const demo = await client.query(
      "insert into users (ism, rol, til, username) values ('Aziz', 'nomzod', 'uz', 'demo') returning id",
    );
    const demoUserId = demo.rows[0].id;

    // Ish beruvchilar va kompaniyalar
    const companyIds = [];
    for (const company of COMPANIES) {
      const user =
        company.name === "Chorsu Market"
          ? { rows: [{ id: demoUserId }] }
          : await client.query(
              "insert into users (ism, rol) values ($1, 'ish_beruvchi') returning id",
              [company.name],
            );
      const row = await client.query(
        `insert into companies (user_id, nom, telefon, tavsif, tasdiqlangan, tez_javob_belgisi)
         values ($1, $2, $3, $4, $5, $6) returning id`,
        [
          user.rows[0].id,
          company.name,
          "+998 90 123 45 67",
          company.name === "Chorsu Market"
            ? "Chorsu bozoridagi oziq-ovqat do'koni. 2016-yildan beri ishlaymiz."
            : null,
          company.verified,
          company.fast,
        ],
      );
      companyIds.push({ id: row.rows[0].id, ...company, userId: user.rows[0].id });
    }

    // Vakansiyalar — turg'un generatordan.
    //
    // Tasodifiy taqsimotga tashlab qo'yib bo'lmaydi: v4 qoidasiga ko'ra
    // 5 tadan kam vakansiyasi bor kanal katalogda ko'rsatilmaydi, ya'ni
    // omadsiz kasb umuman ko'rinmay qoladi. Shuning uchun avval har
    // kasbga MIN_PER_CHANNEL ta o'rin ajratiladi, qolgani tasodifiy.
    const rand = seeded(20260809);
    const MIN_PER_CHANNEL = 6;
    const EXTRA_VACANCIES = 40;
    const openExperiences = ["upToOne", "oneToThree"];
    const professionName = (id) => PROFESSIONS.find((p) => p.id === id).uz;
    const vacancies = [];

    // Qaysi kompaniya qaysi kasbni yolashi mumkin
    const companiesFor = (professionId) =>
      companyIds.filter((c) => KIND_PROFESSIONS[c.kind].includes(professionId));

    // Masofadan va kunlik ish hamma kasbga to'g'ri kelmaydi
    const ONLINE_OK = new Set(["dasturchi", "smm", "administrator"]);
    const DAILY_NOT_OK = new Set([
      "dasturchi",
      "smm",
      "oqituvchi",
      "tarbiyachi",
      "hamshira",
      "administrator",
    ]);

    const slots = [];
    for (const profession of PROFESSIONS) {
      for (let n = 0; n < MIN_PER_CHANNEL; n++) slots.push(profession.id);
    }
    for (let n = 0; n < EXTRA_VACANCIES; n++) {
      slots.push(PROFESSIONS[Math.floor(rand() * PROFESSIONS.length)].id);
    }

    // "Kunlik ishlar" kanali ham bo'sh qolmasin: kunlik ishga yaraydigan
    // kasblardan qo'shimcha o'rin ajratamiz
    const dailyProfessions = PROFESSIONS.filter((p) => !DAILY_NOT_OK.has(p.id)).map((p) => p.id);
    const forcedDaily = new Set();
    for (let n = 0; n < 8; n++) {
      slots.push(dailyProfessions[Math.floor(rand() * dailyProfessions.length)]);
      forcedDaily.add(slots.length - 1);
    }

    for (let i = 0; i < slots.length; i++) {
      const professionId = slots[i];
      const hosts = companiesFor(professionId);
      const company = hosts[Math.floor(rand() * hosts.length)];
      const cityRow = CITIES.find((c) => c.id === company.city);
      const district =
        company.city === "toshkent" ? DISTRICTS[Math.floor(rand() * DISTRICTS.length)] : null;
      // Tavsif bandlik turini ham belgilaydi — kasbga to'g'ri kelmasa
      // boshqasi tanlanadi (dasturchi kunlik emas, farrosh online emas)
      let description = DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)];
      if (forcedDaily.has(i)) {
        const daily = DESCRIPTIONS.filter((d) => d.employment === "daily");
        description = daily[Math.floor(rand() * daily.length)];
      }
      let guard = 0;
      while (
        guard++ < 20 &&
        ((description.employment === "online" && !ONLINE_OK.has(professionId)) ||
          (description.employment === "daily" && DAILY_NOT_OK.has(professionId)))
      ) {
        description = DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)];
      }

      const base = 3_000_000 + Math.floor(rand() * 6) * 500_000;
      const hasRange = rand() < 0.75;
      const negotiable = rand() < 0.08;
      const minutesAgo = Math.floor(rand() * 5000);
      const experience =
        description.experience ?? openExperiences[Math.floor(rand() * openExperiences.length)];
      const views = 20 + Math.floor(rand() * 900);

      const point = district ?? cityRow;
      const jitter = () => (rand() - 0.5) * 0.02;

      const inserted = await client.query(
        `insert into vacancies
           (company_id, lavozim, kasb_id, shahar_id, tuman_id, maosh_min, maosh_max,
            tajriba_talab, tavsif, talablar, bandlik_turi, tarif, korishlar,
            joylashtirilgan_sana, tugash_sana, lat, lng, shoshilinch)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::text[],$11,$12,$13,
                 now() - ($14 || ' minutes')::interval,
                 now() - ($14 || ' minutes')::interval + interval '30 days',
                 $15,$16,$17)
         returning id`,
        [
          company.id,
          professionName(professionId),
          professionId,
          company.city,
          district ? district.id : null,
          negotiable ? null : base,
          negotiable ? null : hasRange ? base + 1_000_000 + Math.floor(rand() * 4) * 500_000 : null,
          experience,
          description.text,
          // 1–3 ta talab, kasbga qarab
          (PROFESSION_REQUIREMENTS[professionId] ?? []).slice(0, 1 + Math.floor(rand() * 3)),
          description.employment,
          rand() < 0.15 ? "standard" : "free",
          views,
          String(minutesAgo),
          point.lat + jitter(),
          point.lng + jitter(),
          // Kunlik ish ko'pincha shoshilinch bo'ladi
          description.employment === "daily" ? rand() < 0.45 : rand() < 0.1,
        ],
      );
      vacancies.push({
        id: inserted.rows[0].id,
        companyId: company.id,
        professionId,
        employment: description.employment,
      });
    }

    // ——— Demo nomzodning kartochkasi ———
    const demoCard = await client.query(
      `insert into candidate_cards
         (user_id, kasb_id, shahar_id, tuman_id, tajriba_daraja, bandlik_turi)
       values ($1, 'sotuvchi', 'toshkent', 'chilonzor', 'upToOne', 'full')
       returning id`,
      [demoUserId],
    );

    // Obunalar (§1.4): tanlangan kasb + unga yaqin 2–3 kanal.
    // oxirgi_korilgan ataylab orqada — shunda ro'yxatda "yangi" belgisi
    // ko'rinadi va kanal modeli o'zini ko'rsatadi.
    const demoChannels = [
      { id: "sotuvchi", soatOldin: 9 },
      { id: "kassir", soatOldin: 30 },
      { id: "administrator", soatOldin: 4 },
      { id: "kunlik", soatOldin: 50 },
    ];
    for (const channel of demoChannels) {
      await client.query(
        `insert into subscriptions (user_id, channel_id, oxirgi_korilgan)
         values ($1, $2, now() - ($3 || ' hours')::interval)`,
        [demoUserId, channel.id, String(channel.soatOldin)],
      );
    }

    // Demo nomzodning uchta arizasi va chati
    const chorsu = companyIds.find((c) => c.name === "Chorsu Market");
    const milano = companyIds.find((c) => c.name === "Milano Cafe");
    const express = companyIds.find((c) => c.name === "Express Yetkazib");
    const havas = companyIds.find((c) => c.name === "Havas Market");

    const pickVacancy = (companyId) => vacancies.find((v) => v.companyId === companyId);

    // Javobsiz ariza uchun — demo egalik qilmagan, boshqa suhbatlarda ishtirok
    // etmagan kompaniyaning vakansiyasi
    const usedCompanies = new Set([chorsu.id, havas.id, milano.id, express.id]);
    const quietVacancy = vacancies.find((v) => !usedCompanies.has(v.companyId));

    // Demo nomzodning saqlagan vakansiyalari — "Saqlangan" filtri bo'sh chiqmasin
    for (const vacancy of vacancies.filter((v) => v.companyId !== chorsu.id).slice(0, 4)) {
      await client.query(
        "insert into saved_vacancies (user_id, vacancy_id) values ($1,$2) on conflict do nothing",
        [demoUserId, vacancy.id],
      );
    }

    // Demo foydalanuvchi o'z kompaniyasiga ariza yubormaydi
    const conversations = [
      {
        vacancy: pickVacancy(havas.id),
        messages: [
          ["ish_beruvchi", "Assalomu alaykum! Kartochkangizni ko'rdik.", false],
          ["nomzod", "Assalomu alaykum, rahmat! Qachon kelay?", true],
          [
            "ish_beruvchi",
            "Ertaga soat 10 da kela olasizmi? Manzil: Havas Market, 2-qavat.",
            false,
          ],
          ["ish_beruvchi", "Pasport nusxasini olib keling.", false],
        ],
      },
      {
        vacancy: pickVacancy(milano.id),
        messages: [
          ["ish_beruvchi", "Kartochkangizni ko'rdik, rahmat. Bir-ikki kunda javob beramiz.", true],
        ],
      },
      {
        vacancy: pickVacancy(express.id),
        messages: [["ish_beruvchi", "Ish vaqti 9:00 dan 18:00 gacha. Moped bormi?", true]],
      },
      // Javobsiz qolgan ariza — Arizalarim ekranida turtki chiqadi
      {
        vacancy: quietVacancy,
        daysAgo: 9,
        messages: [],
      },
    ];

    for (const conversation of conversations) {
      if (!conversation.vacancy) continue;
      const daysAgo = conversation.daysAgo ?? 0;
      const application = await client.query(
        `insert into applications (vacancy_id, candidate_card_id, holat, korilgan_sana, yaratilgan_sana)
         values ($1, $2, $3, $4, now() - ($5 || ' days')::interval)
         on conflict (vacancy_id, candidate_card_id) do nothing
         returning id`,
        [
          conversation.vacancy.id,
          demoCard.rows[0].id,
          conversation.messages.length > 0 ? "korildi" : "yangi",
          conversation.messages.length > 0 ? new Date() : null,
          String(daysAgo),
        ],
      );
      if (application.rows.length === 0) continue;
      const chat = await client.query(
        "insert into chats (application_id) values ($1) returning id",
        [application.rows[0].id],
      );
      await client.query(
        "insert into messages (chat_id, kim_yubordi, matn, oqilgan, sana) values ($1,'tizim','ariza_yuborildi',true, now() - interval '3 hours')",
        [chat.rows[0].id],
      );
      let offset = 150;
      for (const [from, text, read] of conversation.messages) {
        await client.query(
          `insert into messages (chat_id, kim_yubordi, matn, oqilgan, sana)
           values ($1,$2,$3,$4, now() - ($5 || ' minutes')::interval)`,
          [chat.rows[0].id, from, text, read, String(offset)],
        );
        offset -= 30;
      }
      await client.query(
        "update chats set oxirgi_xabar_sana = (select max(sana) from messages where chat_id = $1) where id = $1",
        [chat.rows[0].id],
      );
    }

    // ——— Chorsu Market vakansiyalariga boshqa nomzodlar ———
    const otherCandidates = [
      {
        name: "Nodira Yusupova",
        profession: "kassir",
        district: "yunusobod",
        experience: "oneToThree",
        min: 4_000_000,
        max: 5_000_000,
        message: "Salom, ikki yil kassir bo'lib ishlaganman.",
      },
      {
        name: "Jasur Toshmatov",
        profession: "sotuvchi",
        district: "olmazor",
        experience: "threePlus",
        min: 6_000_000,
        max: 8_000_000,
        message: "Uch yildan ortiq savdo sohasida ishlaganman.",
      },
      {
        name: "Malika Rahimova",
        profession: "sotuvchi",
        district: "sergeli",
        experience: "none",
        min: 3_000_000,
        max: 4_000_000,
        message: null,
      },
      {
        name: "Bekzod Ergashev",
        profession: "kassir",
        district: "mirzo-ulugbek",
        experience: "upToOne",
        min: 4_000_000,
        max: 6_000_000,
        message: null,
      },
    ];

    const chorsuVacancies = vacancies.filter((v) => v.companyId === chorsu.id);
    for (const [index, candidate] of otherCandidates.entries()) {
      const vacancy = chorsuVacancies[index % chorsuVacancies.length];
      if (!vacancy) break;

      const user = await client.query(
        "insert into users (ism, rol) values ($1, 'nomzod') returning id",
        [candidate.name],
      );
      const card = await client.query(
        `insert into candidate_cards
           (user_id, kasb_id, shahar_id, tuman_id, tajriba_daraja, maosh_min, maosh_max,
            bandlik_turi, ish_qidiryapman, korinish)
         values ($1,$2,'toshkent',$3,$4,$5,$6,$7,$8,$9) returning id`,
        [
          user.rows[0].id,
          candidate.profession,
          candidate.district,
          candidate.experience,
          candidate.min,
          candidate.max,
          // Ish turi va "ish qidiryapman" — turg'un urug'dan
          ["full", "part", "shift", "full"][Math.floor(rand() * 4)],
          rand() < 0.6,
          rand() < 0.7 ? "ish_beruvchilar" : "hamma",
        ],
      );
      const application = await client.query(
        "insert into applications (vacancy_id, candidate_card_id) values ($1,$2) returning id",
        [vacancy.id, card.rows[0].id],
      );
      const chat = await client.query(
        "insert into chats (application_id) values ($1) returning id",
        [application.rows[0].id],
      );
      await client.query(
        `insert into messages (chat_id, kim_yubordi, matn, oqilgan, sana)
         values ($1,'tizim','ariza_yuborildi',true, now() - ($2 || ' hours')::interval)`,
        [chat.rows[0].id, String(index + 2)],
      );
      if (candidate.message) {
        await client.query(
          `insert into messages (chat_id, kim_yubordi, matn, oqilgan, sana)
           values ($1,'nomzod',$2,false, now() - ($3 || ' minutes')::interval)`,
          [chat.rows[0].id, candidate.message, String((index + 1) * 40)],
        );
      }
      await client.query(
        "update chats set oxirgi_xabar_sana = (select max(sana) from messages where chat_id = $1) where id = $1",
        [chat.rows[0].id],
      );
    }

    // ——— Ariza yubormagan, lekin "Ish qidiryapman" yoqilgan nomzodlar ———
    // v2 6.1 ning mohiyati shu: passiv nomzod ham bozorda ko'rinadi.
    const openCandidates = [
      ["Dilnoza Karimova", "sotuvchi", "yunusobod", "oneToThree", "full"],
      ["Sardor Aliyev", "haydovchi", "chilonzor", "threePlus", "shift"],
      ["Gulnora Yusupova", "oshpaz", "mirobod", "oneToThree", "full"],
      ["Aziz Nazarov", "kuryer", "sergeli", "none", "part"],
      ["Kamola Sobirova", "administrator", "yakkasaroy", "upToOne", "full"],
      ["Jahongir Umarov", "omborchi", "olmazor", "oneToThree", "shift"],
      ["Nilufar Hasanova", "ofitsiant", "shayxontohur", "none", "part"],
      ["Otabek Rasulov", "quruvchi", "uchtepa", "threePlus", "full"],
      ["Shahnoza Tursunova", "farrosh", "mirzo-ulugbek", "upToOne", "part"],
      ["Rustam Qodirov", "qorovul", "yashnobod", "oneToThree", "shift"],
    ];

    for (const [
      index,
      [name, profession, district, experience, employment],
    ] of openCandidates.entries()) {
      const user = await client.query(
        `insert into users (ism, rol, oxirgi_kirish)
         values ($1, 'nomzod', now() - ($2 || ' days')::interval) returning id`,
        [name, String(index % 5)],
      );
      await client.query(
        `insert into candidate_cards
           (user_id, kasb_id, shahar_id, tuman_id, tajriba_daraja, bandlik_turi,
            ish_qidiryapman, korinish)
         values ($1,$2,'toshkent',$3,$4,$5,true,$6)`,
        [
          user.rows[0].id,
          profession,
          district,
          experience,
          employment,
          index % 3 === 0 ? "hamma" : "ish_beruvchilar",
        ],
      );
    }

    await client.query("commit");

    const counts = await client.query(`
      select
        (select count(*) from vacancies) as vakansiyalar,
        (select count(*) from companies) as kompaniyalar,
        (select count(*) from users) as foydalanuvchilar,
        (select count(*) from chats) as chatlar,
        (select count(*) from messages) as xabarlar
    `);
    console.log("Namunaviy ma'lumotlar yuklandi:", counts.rows[0]);
    console.log("Demo foydalanuvchi user_id:", demoUserId, "(Chorsu Market egasi ham)");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

// Migratsiya faylini eslatib qo'yish uchun — mavjudligini tekshiramiz
readFileSync(join(here, "migrations", "0001_init.sql"), "utf8");

main().catch((error) => failWith(error, process.env.DATABASE_URL));
