import "server-only";
import { query, queryOne, transaction } from "./client";
import type {
  CandidateDTO,
  CardDTO,
  ChatDTO,
  ChatListItemDTO,
  ChatSide,
  ChatUpdateDTO,
  CityDTO,
  CompanyDTO,
  EmployerVacancyDTO,
  Localized,
  MessageDTO,
  Page,
  ProfessionDTO,
  VacancyDTO,
} from "./types";

/* ——— Yordamchilar ——— */

function localized(uz: string | null, cyrl: string | null, ru: string | null): Localized | null {
  if (uz === null && cyrl === null && ru === null) return null;
  return { uz: uz ?? "", "uz-cyrl": cyrl ?? uz ?? "", ru: ru ?? uz ?? "" };
}

function encodeCursor(value: string | number, id: string): string {
  return Buffer.from(JSON.stringify([value, id])).toString("base64url");
}

function decodeCursor(cursor: string | null): [string | number, string] | null {
  if (!cursor) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (Array.isArray(parsed) && parsed.length === 2) {
      return [parsed[0] as string | number, String(parsed[1])];
    }
  } catch {
    // buzilgan kursor — boshidan boshlaymiz
  }
  return null;
}

function timeLabel(value: Date): string {
  return value.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/* ——— Ma'lumotnomalar ——— */

type ProfessionRow = {
  id: string;
  nom_uz: string;
  nom_uz_cyrl: string;
  nom_ru: string;
  kategoriya: string;
};

export async function listProfessions(): Promise<ProfessionDTO[]> {
  const rows = await query<ProfessionRow>(
    "select id, nom_uz, nom_uz_cyrl, nom_ru, kategoriya from professions order by tartib, nom_uz",
  );
  return rows.map((row) => ({
    id: row.id,
    name: { uz: row.nom_uz, "uz-cyrl": row.nom_uz_cyrl, ru: row.nom_ru },
    category: row.kategoriya,
  }));
}

type CityRow = {
  id: string;
  nom_uz: string;
  nom_uz_cyrl: string;
  nom_ru: string;
  districts: { id: string; nom_uz: string; nom_uz_cyrl: string; nom_ru: string }[] | null;
};

export async function listCities(): Promise<CityDTO[]> {
  const rows = await query<CityRow>(`
    select c.id, c.nom_uz, c.nom_uz_cyrl, c.nom_ru,
      coalesce(
        (select json_agg(json_build_object(
            'id', d.id, 'nom_uz', d.nom_uz, 'nom_uz_cyrl', d.nom_uz_cyrl, 'nom_ru', d.nom_ru)
          order by d.tartib)
         from districts d where d.shahar_id = c.id),
        '[]'::json
      ) as districts
    from cities c
    order by c.tartib
  `);

  return rows.map((row) => ({
    id: row.id,
    name: { uz: row.nom_uz, "uz-cyrl": row.nom_uz_cyrl, ru: row.nom_ru },
    districts: (row.districts ?? []).map((d) => ({
      id: d.id,
      name: { uz: d.nom_uz, "uz-cyrl": d.nom_uz_cyrl, ru: d.nom_ru },
    })),
  }));
}

/* ——— Vakansiyalar ——— */

type VacancyRow = {
  id: string;
  lavozim: string;
  kasb_id: string | null;
  kasb_uz: string | null;
  kasb_cyrl: string | null;
  kasb_ru: string | null;
  kompaniya: string;
  tasdiqlangan: boolean;
  tez_javob: boolean;
  shahar_uz: string | null;
  shahar_cyrl: string | null;
  shahar_ru: string | null;
  tuman_uz: string | null;
  tuman_cyrl: string | null;
  tuman_ru: string | null;
  maosh_min: number | null;
  maosh_max: number | null;
  tajriba_talab: VacancyDTO["experience"];
  bandlik_turi: VacancyDTO["employment"];
  tavsif: string | null;
  korishlar: number;
  daqiqa: string;
  arizalar: string;
  masofa: number | null;
  saqlangan: boolean;
  ariza: boolean;
  saralash_qiymati: string | number | null;
};

const VACANCY_COLUMNS = `
  v.id, v.lavozim, v.kasb_id,
  p.nom_uz as kasb_uz, p.nom_uz_cyrl as kasb_cyrl, p.nom_ru as kasb_ru,
  c.nom as kompaniya, c.tasdiqlangan, c.tez_javob_belgisi as tez_javob,
  sh.nom_uz as shahar_uz, sh.nom_uz_cyrl as shahar_cyrl, sh.nom_ru as shahar_ru,
  tm.nom_uz as tuman_uz, tm.nom_uz_cyrl as tuman_cyrl, tm.nom_ru as tuman_ru,
  v.maosh_min, v.maosh_max, v.tajriba_talab, v.bandlik_turi, v.tavsif, v.korishlar,
  floor(extract(epoch from (now() - v.joylashtirilgan_sana)) / 60) as daqiqa,
  (select count(*) from applications a where a.vacancy_id = v.id) as arizalar
`;

const VACANCY_JOINS = `
  from vacancies v
  join companies c on c.id = v.company_id
  left join professions p on p.id = v.kasb_id
  left join cities sh on sh.id = v.shahar_id
  left join districts tm on tm.id = v.tuman_id
`;

function mapVacancy(row: VacancyRow): VacancyDTO {
  return {
    id: row.id,
    title: row.lavozim,
    professionId: row.kasb_id,
    professionName: localized(row.kasb_uz, row.kasb_cyrl, row.kasb_ru),
    company: row.kompaniya,
    verified: row.tasdiqlangan,
    fastReply: row.tez_javob,
    cityName: localized(row.shahar_uz, row.shahar_cyrl, row.shahar_ru),
    districtName: localized(row.tuman_uz, row.tuman_cyrl, row.tuman_ru),
    salaryMin: row.maosh_min,
    salaryMax: row.maosh_max,
    experience: row.tajriba_talab,
    employment: row.bandlik_turi,
    description: row.tavsif ?? "",
    postedMinutesAgo: Number(row.daqiqa),
    views: row.korishlar,
    applications: Number(row.arizalar),
    distanceKm: row.masofa === null ? null : Math.round(row.masofa * 10) / 10,
    saved: row.saqlangan,
    applied: row.ariza,
  };
}

export type VacancySort = "new" | "nearby" | "salary";

export type ListVacanciesOptions = {
  userId?: string | null;
  professionId?: string | null;
  cityId?: string | null;
  search?: string | null;
  sort?: VacancySort;
  cursor?: string | null;
  limit?: number;
  lat?: number | null;
  lng?: number | null;
};

/**
 * Vakansiyalar ro'yxati.
 * Sahifalash keyset usulida — OFFSET ishlatilmaydi, shuning uchun cheksiz
 * aylantirishda yangi vakansiya qo'shilsa ham qatorlar takrorlanmaydi.
 */
export async function listVacancies(options: ListVacanciesOptions): Promise<Page<VacancyDTO>> {
  const {
    userId = null,
    professionId = null,
    cityId = null,
    search = null,
    sort = "new",
    cursor = null,
    limit = 12,
    lat = null,
    lng = null,
  } = options;

  const params: unknown[] = [userId, lat, lng];
  const where: string[] = ["v.holat = 'faol'"];

  if (professionId) {
    params.push(professionId);
    where.push(`v.kasb_id = $${params.length}`);
  }
  if (cityId) {
    params.push(cityId);
    where.push(`v.shahar_id = $${params.length}`);
  }
  if (search && search.trim()) {
    params.push(search.trim());
    where.push(`v.qidiruv @@ websearch_to_tsquery('simple', $${params.length})`);
  }

  // Saralash ustuni: keyset kursori shu qiymatga tayanadi.
  // "Yaqinimda"da koordinatasi yo'q vakansiya oxirida qolishi uchun coalesce.
  const distanceExpr = "haversine_km($2, $3, v.lat, v.lng)";
  const sortColumn =
    sort === "nearby"
      ? `coalesce(${distanceExpr}, 1e9)`
      : sort === "salary"
        ? "coalesce(v.maosh_max, v.maosh_min, 0)"
        : "v.joylashtirilgan_sana";
  // Yangi va maosh — kamayish tartibida, yaqinlik — o'sish tartibida
  const ascending = sort === "nearby";
  const direction = ascending ? "asc" : "desc";
  const comparison = ascending ? ">" : "<";

  const decoded = decodeCursor(cursor);
  if (decoded) {
    const [value, id] = decoded;
    params.push(sort === "new" ? new Date(String(value)) : Number(value));
    const valueParam = params.length;
    params.push(id);
    const idParam = params.length;
    // (saralash, id) juftligi bo'yicha qat'iy tartib — teng qiymatlar ham takrorlanmaydi
    where.push(`(${sortColumn}, v.id) ${comparison} ($${valueParam}, $${idParam}::uuid)`);
  }

  params.push(limit + 1);
  const limitParam = params.length;

  const sql = `
    select ${VACANCY_COLUMNS},
      ${distanceExpr} as masofa,
      exists(select 1 from saved_vacancies s where s.vacancy_id = v.id and s.user_id = $1::uuid) as saqlangan,
      exists(
        select 1 from applications a
        join candidate_cards cc on cc.id = a.candidate_card_id
        where a.vacancy_id = v.id and cc.user_id = $1::uuid
      ) as ariza,
      ${sortColumn} as saralash_qiymati
    ${VACANCY_JOINS}
    where ${where.join(" and ")}
    order by ${sortColumn} ${direction}, v.id ${direction}
    limit $${limitParam}
  `;

  const rows = await query<VacancyRow>(sql, params);
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];

  return {
    items: page.map(mapVacancy),
    cursor:
      hasMore && last
        ? encodeCursor(
            sort === "new"
              ? new Date(String(last.saralash_qiymati)).toISOString()
              : Number(last.saralash_qiymati),
            last.id,
          )
        : null,
  };
}

export async function getVacancy(id: string, userId: string | null): Promise<VacancyDTO | null> {
  const row = await queryOne<VacancyRow>(
    `select ${VACANCY_COLUMNS},
       null::double precision as masofa,
       exists(select 1 from saved_vacancies s where s.vacancy_id = v.id and s.user_id = $2::uuid) as saqlangan,
       exists(
         select 1 from applications a
         join candidate_cards cc on cc.id = a.candidate_card_id
         where a.vacancy_id = v.id and cc.user_id = $2::uuid
       ) as ariza,
       null::text as saralash_qiymati
     ${VACANCY_JOINS}
     where v.id = $1::uuid`,
    [id, userId],
  );
  return row ? mapVacancy(row) : null;
}

export async function incrementViews(id: string): Promise<void> {
  await query("update vacancies set korishlar = korishlar + 1 where id = $1::uuid", [id]);
}

/* ——— Saqlangan ——— */

export async function listSavedVacancies(userId: string): Promise<VacancyDTO[]> {
  const rows = await query<VacancyRow>(
    `select ${VACANCY_COLUMNS},
       null::double precision as masofa,
       true as saqlangan,
       exists(
         select 1 from applications a
         join candidate_cards cc on cc.id = a.candidate_card_id
         where a.vacancy_id = v.id and cc.user_id = $1::uuid
       ) as ariza,
       null::text as saralash_qiymati
     ${VACANCY_JOINS}
     join saved_vacancies sv on sv.vacancy_id = v.id and sv.user_id = $1::uuid
     order by sv.sana desc`,
    [userId],
  );
  return rows.map(mapVacancy);
}

export async function toggleSaved(userId: string, vacancyId: string): Promise<boolean> {
  const deleted = await query<{ vacancy_id: string }>(
    "delete from saved_vacancies where user_id = $1::uuid and vacancy_id = $2::uuid returning vacancy_id",
    [userId, vacancyId],
  );
  if (deleted.length > 0) return false;

  await query(
    "insert into saved_vacancies (user_id, vacancy_id) values ($1::uuid, $2::uuid) on conflict do nothing",
    [userId, vacancyId],
  );
  return true;
}

/* ——— Ariza ——— */

/** Ariza yuborilganda chat ham ochiladi — ariza ro'yxati emas, chat modeli */
export async function applyToVacancy(userId: string, vacancyId: string): Promise<{ chatId: string }> {
  return transaction(async (run) => {
    const card = await run<{ id: string }>(
      "select id from candidate_cards where user_id = $1::uuid",
      [userId],
    );
    if (card.length === 0) throw new Error("Nomzod kartochkasi topilmadi");

    const application = await run<{ id: string }>(
      `insert into applications (vacancy_id, candidate_card_id)
       values ($1::uuid, $2::uuid)
       on conflict (vacancy_id, candidate_card_id) do update set holat = applications.holat
       returning id`,
      [vacancyId, card[0].id],
    );

    const chat = await run<{ id: string }>(
      `insert into chats (application_id) values ($1::uuid)
       on conflict (application_id) do update set oxirgi_xabar_sana = now()
       returning id`,
      [application[0].id],
    );

    await run(
      `insert into messages (chat_id, kim_yubordi, matn, oqilgan)
       select $1::uuid, 'tizim', 'ariza_yuborildi', true
       where not exists (
         select 1 from messages where chat_id = $1::uuid and kim_yubordi = 'tizim'
       )`,
      [chat[0].id],
    );

    return { chatId: chat[0].id };
  });
}

/* ——— Chatlar (nomzod tomoni) ——— */

type ChatListRow = {
  id: string;
  kompaniya: string;
  tez_javob: boolean;
  kasb_uz: string | null;
  kasb_cyrl: string | null;
  kasb_ru: string | null;
  oxirgi_matn: string | null;
  oxirgi_sana: Date;
  oqilmagan: string;
};

export async function listChats(userId: string): Promise<ChatListItemDTO[]> {
  const rows = await query<ChatListRow>(
    `select ch.id, co.nom as kompaniya, co.tez_javob_belgisi as tez_javob,
       p.nom_uz as kasb_uz, p.nom_uz_cyrl as kasb_cyrl, p.nom_ru as kasb_ru,
       (select coalesce(m.matn, 'ovozli_xabar') from messages m
         where m.chat_id = ch.id order by m.sana desc, m.id desc limit 1) as oxirgi_matn,
       ch.oxirgi_xabar_sana as oxirgi_sana,
       (select count(*) from messages m
         where m.chat_id = ch.id and m.oqilgan = false and m.kim_yubordi = 'ish_beruvchi') as oqilmagan
     from chats ch
     join applications a on a.id = ch.application_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     join vacancies v on v.id = a.vacancy_id
     join companies co on co.id = v.company_id
     left join professions p on p.id = v.kasb_id
     where cc.user_id = $1::uuid
     order by ch.oxirgi_xabar_sana desc`,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    company: row.kompaniya,
    fastReply: row.tez_javob,
    professionName: localized(row.kasb_uz, row.kasb_cyrl, row.kasb_ru),
    lastMessage: row.oxirgi_matn ?? "",
    lastMessageAt: timeLabel(row.oxirgi_sana),
    unread: Number(row.oqilmagan),
  }));
}

type MessageRow = {
  id: string;
  kim_yubordi: MessageDTO["from"];
  matn: string | null;
  ovoz_url: string | null;
  davomiylik_ms: number | null;
  oqilgan: boolean;
  sana: Date;
};

const MESSAGE_SELECT =
  "select id, kim_yubordi, matn, ovoz_url, davomiylik_ms, oqilgan, sana from messages";

function toMessage(row: MessageRow): MessageDTO {
  return {
    id: row.id,
    from: row.kim_yubordi,
    text: row.matn ?? "",
    time: timeLabel(row.sana),
    at: row.sana.toISOString(),
    read: row.oqilgan,
    ...(row.ovoz_url ? { audioUrl: row.ovoz_url } : {}),
    ...(row.davomiylik_ms === null ? {} : { durationMs: row.davomiylik_ms }),
  };
}

async function chatMessages(chatId: string): Promise<MessageDTO[]> {
  const rows = await query<MessageRow>(
    `${MESSAGE_SELECT} where chat_id = $1::uuid order by sana, id`,
    [chatId],
  );
  return rows.map(toMessage);
}

export async function getChat(chatId: string, userId: string): Promise<ChatDTO | null> {
  const row = await queryOne<{
    id: string;
    kompaniya: string;
    tez_javob: boolean;
    kasb_uz: string | null;
    kasb_cyrl: string | null;
    kasb_ru: string | null;
  }>(
    `select ch.id, co.nom as kompaniya, co.tez_javob_belgisi as tez_javob,
       p.nom_uz as kasb_uz, p.nom_uz_cyrl as kasb_cyrl, p.nom_ru as kasb_ru
     from chats ch
     join applications a on a.id = ch.application_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     join vacancies v on v.id = a.vacancy_id
     join companies co on co.id = v.company_id
     left join professions p on p.id = v.kasb_id
     where ch.id = $1::uuid and cc.user_id = $2::uuid`,
    [chatId, userId],
  );
  if (!row) return null;

  return {
    id: row.id,
    title: row.kompaniya,
    fastReply: row.tez_javob,
    professionName: localized(row.kasb_uz, row.kasb_cyrl, row.kasb_ru),
    messages: await chatMessages(row.id),
  };
}

/* ——— Nomzod kartochkasi ——— */

type CardRow = {
  id: string;
  ism: string;
  kasb_id: string | null;
  shahar_id: string | null;
  tuman_id: string | null;
  tajriba_daraja: CardDTO["experience"];
  maosh_min: number | null;
  maosh_max: number | null;
  foto_url: string | null;
  video_url: string | null;
  ovoz_url: string | null;
};

export async function getCard(userId: string): Promise<CardDTO | null> {
  const row = await queryOne<CardRow>(
    `select cc.id, u.ism, cc.kasb_id, cc.shahar_id, cc.tuman_id, cc.tajriba_daraja,
            cc.maosh_min, cc.maosh_max, cc.foto_url, cc.video_url, cc.ovoz_url
     from candidate_cards cc
     join users u on u.id = cc.user_id
     where cc.user_id = $1::uuid`,
    [userId],
  );
  if (!row) return null;

  return {
    id: row.id,
    name: row.ism,
    professionId: row.kasb_id,
    cityId: row.shahar_id,
    districtId: row.tuman_id,
    experience: row.tajriba_daraja,
    salaryMin: row.maosh_min,
    salaryMax: row.maosh_max,
    photoUrl: row.foto_url,
    videoUrl: row.video_url,
    voiceUrl: row.ovoz_url,
  };
}

export async function saveCard(userId: string, card: Omit<CardDTO, "id">): Promise<void> {
  await transaction(async (run) => {
    await run("update users set ism = $2 where id = $1::uuid", [userId, card.name]);
    await run(
      `insert into candidate_cards
         (user_id, kasb_id, shahar_id, tuman_id, tajriba_daraja, maosh_min, maosh_max)
       values ($1::uuid, $2, $3, $4, $5, $6, $7)
       on conflict (user_id) do update set
         kasb_id = excluded.kasb_id,
         shahar_id = excluded.shahar_id,
         tuman_id = excluded.tuman_id,
         tajriba_daraja = excluded.tajriba_daraja,
         maosh_min = excluded.maosh_min,
         maosh_max = excluded.maosh_max`,
      [
        userId,
        card.professionId,
        card.cityId,
        card.districtId,
        card.experience,
        card.salaryMin,
        card.salaryMax,
      ],
    );
  });
}

/* ——— Ish beruvchi ——— */

export async function getCompany(companyId: string): Promise<CompanyDTO | null> {
  const row = await queryOne<{
    id: string;
    nom: string;
    telefon: string | null;
    tavsif: string | null;
    tasdiqlangan: boolean;
    tez_javob_belgisi: boolean;
  }>(
    "select id, nom, telefon, tavsif, tasdiqlangan, tez_javob_belgisi from companies where id = $1::uuid",
    [companyId],
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.nom,
    phone: row.telefon,
    about: row.tavsif,
    verified: row.tasdiqlangan,
    fastReply: row.tez_javob_belgisi,
  };
}

type EmployerVacancyRow = {
  id: string;
  lavozim: string;
  kasb_uz: string | null;
  kasb_cyrl: string | null;
  kasb_ru: string | null;
  shahar_uz: string | null;
  shahar_cyrl: string | null;
  shahar_ru: string | null;
  tuman_uz: string | null;
  tuman_cyrl: string | null;
  tuman_ru: string | null;
  maosh_min: number | null;
  maosh_max: number | null;
  bandlik_turi: EmployerVacancyDTO["employment"];
  tavsif: string | null;
  holat: EmployerVacancyDTO["status"];
  tarif: EmployerVacancyDTO["plan"];
  korishlar: number;
  arizalar: string;
  yangi_arizalar: string;
  daqiqa: string;
  qolgan_kun: string;
};

export async function listEmployerVacancies(companyId: string): Promise<EmployerVacancyDTO[]> {
  const rows = await query<EmployerVacancyRow>(
    `select v.id, v.lavozim,
       p.nom_uz as kasb_uz, p.nom_uz_cyrl as kasb_cyrl, p.nom_ru as kasb_ru,
       sh.nom_uz as shahar_uz, sh.nom_uz_cyrl as shahar_cyrl, sh.nom_ru as shahar_ru,
       tm.nom_uz as tuman_uz, tm.nom_uz_cyrl as tuman_cyrl, tm.nom_ru as tuman_ru,
       v.maosh_min, v.maosh_max, v.bandlik_turi, v.tavsif, v.holat, v.tarif, v.korishlar,
       (select count(*) from applications a where a.vacancy_id = v.id) as arizalar,
       (select count(*) from applications a where a.vacancy_id = v.id and a.holat = 'yangi') as yangi_arizalar,
       floor(extract(epoch from (now() - v.joylashtirilgan_sana)) / 60) as daqiqa,
       greatest(0, ceil(extract(epoch from (v.tugash_sana - now())) / 86400)) as qolgan_kun
     from vacancies v
     left join professions p on p.id = v.kasb_id
     left join cities sh on sh.id = v.shahar_id
     left join districts tm on tm.id = v.tuman_id
     where v.company_id = $1::uuid
     order by v.joylashtirilgan_sana desc`,
    [companyId],
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.lavozim,
    professionName: localized(row.kasb_uz, row.kasb_cyrl, row.kasb_ru),
    cityName: localized(row.shahar_uz, row.shahar_cyrl, row.shahar_ru),
    districtName: localized(row.tuman_uz, row.tuman_cyrl, row.tuman_ru),
    salaryMin: row.maosh_min,
    salaryMax: row.maosh_max,
    employment: row.bandlik_turi,
    description: row.tavsif ?? "",
    status: row.holat,
    plan: row.tarif,
    views: row.korishlar,
    applications: Number(row.arizalar),
    newApplications: Number(row.yangi_arizalar),
    postedMinutesAgo: Number(row.daqiqa),
    daysLeft: Number(row.qolgan_kun),
  }));
}

export type NewVacancyInput = {
  companyId: string;
  professionId: string;
  title: string;
  cityId: string;
  districtId: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  employment: EmployerVacancyDTO["employment"];
  description: string;
};

export async function createVacancy(input: NewVacancyInput): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `insert into vacancies
       (company_id, lavozim, kasb_id, shahar_id, tuman_id, maosh_min, maosh_max,
        bandlik_turi, tavsif, lat, lng)
     select $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, c.lat, c.lng
     from (select 41.311081 as lat, 69.240562 as lng) c
     returning id`,
    [
      input.companyId,
      input.title,
      input.professionId,
      input.cityId,
      input.districtId,
      input.salaryMin,
      input.salaryMax,
      input.employment,
      input.description,
    ],
  );
  if (!row) throw new Error("Vakansiya yaratilmadi");
  return row.id;
}

export async function deleteVacancy(companyId: string, vacancyId: string): Promise<void> {
  await query("delete from vacancies where id = $1::uuid and company_id = $2::uuid", [
    vacancyId,
    companyId,
  ]);
}

type CandidateRow = {
  chat_id: string;
  card_id: string;
  ism: string;
  kasb_uz: string | null;
  kasb_cyrl: string | null;
  kasb_ru: string | null;
  shahar_uz: string | null;
  shahar_cyrl: string | null;
  shahar_ru: string | null;
  tuman_uz: string | null;
  tuman_cyrl: string | null;
  tuman_ru: string | null;
  tajriba_daraja: CandidateDTO["experience"];
  maosh_min: number | null;
  maosh_max: number | null;
  lavozim: string;
  oxirgi_matn: string | null;
  oxirgi_sana: Date;
  oqilmagan: string;
};

export async function listCandidates(companyId: string): Promise<CandidateDTO[]> {
  const rows = await query<CandidateRow>(
    `select ch.id as chat_id, cc.id as card_id, u.ism,
       p.nom_uz as kasb_uz, p.nom_uz_cyrl as kasb_cyrl, p.nom_ru as kasb_ru,
       sh.nom_uz as shahar_uz, sh.nom_uz_cyrl as shahar_cyrl, sh.nom_ru as shahar_ru,
       tm.nom_uz as tuman_uz, tm.nom_uz_cyrl as tuman_cyrl, tm.nom_ru as tuman_ru,
       cc.tajriba_daraja, cc.maosh_min, cc.maosh_max, v.lavozim,
       (select coalesce(m.matn, 'ovozli_xabar') from messages m
         where m.chat_id = ch.id order by m.sana desc, m.id desc limit 1) as oxirgi_matn,
       ch.oxirgi_xabar_sana as oxirgi_sana,
       (select count(*) from messages m
         where m.chat_id = ch.id and m.oqilgan = false and m.kim_yubordi = 'nomzod') as oqilmagan
     from chats ch
     join applications a on a.id = ch.application_id
     join vacancies v on v.id = a.vacancy_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     join users u on u.id = cc.user_id
     left join professions p on p.id = cc.kasb_id
     left join cities sh on sh.id = cc.shahar_id
     left join districts tm on tm.id = cc.tuman_id
     where v.company_id = $1::uuid
     order by ch.oxirgi_xabar_sana desc`,
    [companyId],
  );

  return rows.map((row) => ({
    id: row.card_id,
    chatId: row.chat_id,
    name: row.ism,
    professionName: localized(row.kasb_uz, row.kasb_cyrl, row.kasb_ru),
    cityName: localized(row.shahar_uz, row.shahar_cyrl, row.shahar_ru),
    districtName: localized(row.tuman_uz, row.tuman_cyrl, row.tuman_ru),
    experience: row.tajriba_daraja,
    salaryMin: row.maosh_min,
    salaryMax: row.maosh_max,
    vacancyTitle: row.lavozim,
    lastMessage: row.oxirgi_matn ?? "",
    lastMessageAt: timeLabel(row.oxirgi_sana),
    unread: Number(row.oqilmagan),
  }));
}

export async function getEmployerChat(chatId: string, companyId: string): Promise<ChatDTO | null> {
  const row = await queryOne<{
    id: string;
    ism: string;
    kasb_uz: string | null;
    kasb_cyrl: string | null;
    kasb_ru: string | null;
  }>(
    `select ch.id, u.ism,
       p.nom_uz as kasb_uz, p.nom_uz_cyrl as kasb_cyrl, p.nom_ru as kasb_ru
     from chats ch
     join applications a on a.id = ch.application_id
     join vacancies v on v.id = a.vacancy_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     join users u on u.id = cc.user_id
     left join professions p on p.id = cc.kasb_id
     where ch.id = $1::uuid and v.company_id = $2::uuid`,
    [chatId, companyId],
  );
  if (!row) return null;

  return {
    id: row.id,
    title: row.ism,
    fastReply: false,
    professionName: localized(row.kasb_uz, row.kasb_cyrl, row.kasb_ru),
    messages: await chatMessages(row.id),
  };
}

/* ——— Yozishuv ——— */

/**
 * Foydalanuvchi shu chatda qaysi tomon ekanini aniqlaydi.
 * Bitta yo'l ikkala tomonga ham xizmat qiladi — kim yozayotgani so'rovdan
 * emas, bazadagi bog'lanishdan kelib chiqadi.
 */
export async function chatSide(chatId: string, userId: string): Promise<ChatSide | null> {
  const row = await queryOne<{ nomzod: boolean; ish_beruvchi: boolean }>(
    `select cc.user_id = $2::uuid as nomzod, co.user_id = $2::uuid as ish_beruvchi
     from chats ch
     join applications a on a.id = ch.application_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     join vacancies v on v.id = a.vacancy_id
     join companies co on co.id = v.company_id
     where ch.id = $1::uuid`,
    [chatId, userId],
  );
  if (!row) return null;
  if (row.nomzod) return "nomzod";
  if (row.ish_beruvchi) return "ish_beruvchi";
  return null;
}

const other = (side: ChatSide): ChatSide => (side === "nomzod" ? "ish_beruvchi" : "nomzod");

export async function sendMessage(
  chatId: string,
  from: ChatSide,
  content: { text?: string; audioId?: string; durationMs?: number },
): Promise<MessageDTO> {
  const text = content.text?.trim() || null;
  const audioUrl = content.audioId ? `/api/audio/${content.audioId}` : null;
  if (!text && !audioUrl) throw new Error("Bo'sh xabar");

  return transaction(async (run) => {
    const rows = await run<MessageRow>(
      `insert into messages (chat_id, kim_yubordi, matn, ovoz_url, davomiylik_ms)
       values ($1::uuid, $2, $3, $4, $5)
       returning id, kim_yubordi, matn, ovoz_url, davomiylik_ms, oqilgan, sana`,
      [chatId, from, text, audioUrl, content.durationMs ?? null],
    );
    // Xabarlar ro'yxati shu ustun bo'yicha tartiblanadi
    await run("update chats set oxirgi_xabar_sana = $2 where id = $1::uuid", [
      chatId,
      rows[0].sana,
    ]);
    return toMessage(rows[0]);
  });
}

/** Ochiq chatga kelgan yangi xabarlar — `since` dan keyingilari */
export async function messagesSince(
  chatId: string,
  side: ChatSide,
  since: string | null,
): Promise<ChatUpdateDTO> {
  const rows = since
    ? await query<MessageRow>(
        `${MESSAGE_SELECT} where chat_id = $1::uuid and sana > $2::timestamptz order by sana, id`,
        [chatId, since],
      )
    : await query<MessageRow>(`${MESSAGE_SELECT} where chat_id = $1::uuid order by sana, id`, [
        chatId,
      ]);

  // O'zim yuborgan xabarlardan qaysilari o'qilgani — ikkinchi belgi uchun.
  // Har birini alohida yuborish o'rniga eng oxirgi o'qilgan vaqtni beramiz.
  const read = await queryOne<{ oxirgi: Date | null }>(
    `select max(sana) as oxirgi from messages
     where chat_id = $1::uuid and kim_yubordi = $2 and oqilgan = true`,
    [chatId, side],
  );

  return {
    messages: rows.map(toMessage),
    readUpTo: read?.oxirgi ? read.oxirgi.toISOString() : null,
  };
}

/** Chat ochilganda qarshi tomonning xabarlari o'qilgan deb belgilanadi */
export async function markChatRead(chatId: string, side: ChatSide): Promise<void> {
  await query(
    `update messages set oqilgan = true
     where chat_id = $1::uuid and kim_yubordi = $2 and oqilgan = false`,
    [chatId, other(side)],
  );
}

/** Tab bardagi belgi uchun — nomzod tomoni */
export async function unreadTotal(userId: string): Promise<number> {
  const row = await queryOne<{ soni: string }>(
    `select count(*) as soni from messages m
     join chats ch on ch.id = m.chat_id
     join applications a on a.id = ch.application_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     where cc.user_id = $1::uuid and m.kim_yubordi = 'ish_beruvchi' and m.oqilgan = false`,
    [userId],
  );
  return Number(row?.soni ?? 0);
}

/** Tab bardagi belgi uchun — ish beruvchi tomoni */
export async function unreadTotalForCompany(companyId: string): Promise<number> {
  const row = await queryOne<{ soni: string }>(
    `select count(*) as soni from messages m
     join chats ch on ch.id = m.chat_id
     join applications a on a.id = ch.application_id
     join vacancies v on v.id = a.vacancy_id
     where v.company_id = $1::uuid and m.kim_yubordi = 'nomzod' and m.oqilgan = false`,
    [companyId],
  );
  return Number(row?.soni ?? 0);
}

/* ——— Ovozli xabar ——— */

export async function saveAudio(
  bytes: Buffer,
  mimeType: string,
  durationMs: number,
): Promise<string> {
  const row = await queryOne<{ id: string }>(
    "insert into message_audio (bayt, turi, davomiylik_ms) values ($1, $2, $3) returning id",
    [bytes, mimeType, durationMs],
  );
  if (!row) throw new Error("Ovoz saqlanmadi");
  return row.id;
}

/**
 * Ovozni faqat shu yozishuv ishtirokchisi ola oladi.
 * Bog'lanish `messages.ovoz_url` orqali — spetsifikatsiyadagi ustun o'sha,
 * shuning uchun qo'shimcha kalit ustun kiritilmadi.
 */
export async function getAudioForUser(
  id: string,
  userId: string,
): Promise<{ bytes: Buffer; mimeType: string } | null> {
  const row = await queryOne<{ bayt: Buffer; turi: string }>(
    `select ma.bayt, ma.turi from message_audio ma
     join messages m on m.ovoz_url = '/api/audio/' || ma.id
     join chats ch on ch.id = m.chat_id
     join applications a on a.id = ch.application_id
     join candidate_cards cc on cc.id = a.candidate_card_id
     join vacancies v on v.id = a.vacancy_id
     join companies co on co.id = v.company_id
     where ma.id = $1::uuid and (cc.user_id = $2::uuid or co.user_id = $2::uuid)
     limit 1`,
    [id, userId],
  );
  return row ? { bytes: row.bayt, mimeType: row.turi } : null;
}

/* ——— Autentifikatsiya ——— */

export type AuthUser = {
  id: string;
  name: string;
  role: "nomzod" | "ish_beruvchi";
  photoUrl: string | null;
  hasCard: boolean;
  companyId: string | null;
};

type AuthUserRow = {
  id: string;
  ism: string;
  rol: AuthUser["role"];
  foto_url: string | null;
  card_id: string | null;
  company_id: string | null;
};

const AUTH_USER_SELECT = `
  select u.id, u.ism, u.rol, u.foto_url,
    (select cc.id from candidate_cards cc where cc.user_id = u.id) as card_id,
    (select c.id from companies c where c.user_id = u.id order by c.nom limit 1) as company_id
  from users u
`;

function mapAuthUser(row: AuthUserRow): AuthUser {
  return {
    id: row.id,
    name: row.ism,
    role: row.rol,
    photoUrl: row.foto_url,
    hasCard: row.card_id !== null,
    companyId: row.company_id,
  };
}

export async function getAuthUser(userId: string): Promise<AuthUser | null> {
  const row = await queryOne<AuthUserRow>(`${AUTH_USER_SELECT} where u.id = $1::uuid`, [userId]);
  return row ? mapAuthUser(row) : null;
}

export type TelegramProfile = {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

/** Telegram bo'yicha foydalanuvchini topadi yoki yaratadi */
export async function upsertTelegramUser(profile: TelegramProfile): Promise<AuthUser> {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();

  const row = await queryOne<{ id: string }>(
    `insert into users (telegram_id, ism, rol, username, foto_url, oxirgi_kirish)
     values ($1, $2, 'nomzod', $3, $4, now())
     on conflict (telegram_id) do update set
       ism = excluded.ism,
       username = excluded.username,
       foto_url = excluded.foto_url,
       oxirgi_kirish = now()
     returning id`,
    [profile.telegramId, fullName || "Foydalanuvchi", profile.username ?? null, profile.photoUrl ?? null],
  );
  if (!row) throw new Error("Foydalanuvchi yaratilmadi");

  const user = await getAuthUser(row.id);
  if (!user) throw new Error("Foydalanuvchi topilmadi");
  return user;
}

export async function setUserRole(userId: string, role: AuthUser["role"]): Promise<void> {
  await query("update users set rol = $2 where id = $1::uuid", [userId, role]);
}

/** Ish beruvchiga o'tganda kompaniya bo'lmasa — yaratiladi */
export async function ensureCompany(
  userId: string,
  name: string,
  phone: string | null,
): Promise<string> {
  const existing = await queryOne<{ id: string }>(
    "select id from companies where user_id = $1::uuid order by nom limit 1",
    [userId],
  );
  if (existing) return existing.id;

  const row = await queryOne<{ id: string }>(
    "insert into companies (user_id, nom, telefon) values ($1::uuid, $2, $3) returning id",
    [userId, name, phone],
  );
  if (!row) throw new Error("Kompaniya yaratilmadi");
  return row.id;
}

/** Ro'yxatdan o'tishda kartochkaning eng kerakli ikkita maydoni */
export async function createMinimalCard(
  userId: string,
  professionId: string,
  cityId: string,
): Promise<void> {
  await query(
    `insert into candidate_cards (user_id, kasb_id, shahar_id)
     values ($1::uuid, $2, $3)
     on conflict (user_id) do update set kasb_id = excluded.kasb_id, shahar_id = excluded.shahar_id`,
    [userId, professionId, cityId],
  );
}

/** Mahalliy sinov uchun: namunaviy nomzod */
export async function findDemoUser(): Promise<AuthUser | null> {
  const row = await queryOne<AuthUserRow>(
    `${AUTH_USER_SELECT} where u.username = 'demo' limit 1`,
  );
  return row ? mapAuthUser(row) : null;
}
