import "server-only";
import { query, queryOne } from "./client";
import { EMPLOYMENT_TYPES } from "./types";
import type {
  ChannelDTO,
  ChannelGroupDTO,
  ChannelListItemDTO,
  EmploymentType,
  Localized,
} from "./types";

/**
 * Kanallar (v4, 1-bo'lim).
 *
 * Kanal a'zoligi jadvalda saqlanmaydi — u `channel_vacancies`
 * ko'rinishidan kelib chiqadi (kasb kanali kasb_id bo'yicha, "Kunlik
 * ishlar" bandlik_turi bo'yicha). Shuning uchun vakansiya joylashtirilganda
 * kanalga qo'shish degan alohida qadam yo'q: u o'z-o'zidan tegishli
 * kanallarda paydo bo'ladi.
 */

/** Katalogda ko'rinish uchun kanalda shuncha vakansiya bo'lishi kerak (§1.3) */
export const MIN_CHANNEL_VACANCIES = 5;

function localized(uz: string, cyrl: string | null, ru: string | null): Localized {
  return { uz, "uz-cyrl": cyrl ?? uz, ru: ru ?? uz };
}

type ChannelRow = {
  id: string;
  nom_uz: string;
  nom_uz_cyrl: string | null;
  nom_ru: string | null;
  guruh: string;
  obuna: boolean;
  ovozsiz: boolean;
  qadalgan: boolean;
  yangi: string;
  vakansiyalar: string;
  obunachilar: string;
  oxirgi_lavozim: string | null;
  oxirgi_kompaniya: string | null;
  oxirgi_maosh_min: number | null;
  oxirgi_maosh_max: number | null;
  oxirgi_daqiqa: string | null;
};

/**
 * Har kanal uchun: obuna holati, yangi vakansiyalar soni va oxirgi
 * vakansiya. Oxirgi vakansiya lateral join bilan olinadi — kanal soni
 * kichik (20–25), ya'ni bu N+1 emas, bitta so'rov.
 */
const CHANNEL_SELECT = `
  select
    ch.id, ch.nom_uz, ch.nom_uz_cyrl, ch.nom_ru, ch.guruh,
    s.user_id is not null as obuna,
    coalesce(s.ovozsiz, false) as ovozsiz,
    coalesce(s.qadalgan, false) as qadalgan,
    coalesce(stat.jami, 0) as vakansiyalar,
    ch.bazaviy_obunachi + coalesce(subs.jami, 0) as obunachilar,
    -- Oxirgi kirgandan keyin qo'shilganlar. Obuna bo'lmagan kanalda 0.
    coalesce((
      select count(*) from channel_vacancies cv
       where cv.channel_id = ch.id
         and s.oxirgi_korilgan is not null
         and cv.joylashtirilgan_sana > s.oxirgi_korilgan
    ), 0) as yangi,
    oxirgi.lavozim as oxirgi_lavozim,
    oxirgi.kompaniya as oxirgi_kompaniya,
    oxirgi.maosh_min as oxirgi_maosh_min,
    oxirgi.maosh_max as oxirgi_maosh_max,
    oxirgi.daqiqa as oxirgi_daqiqa
  from channels ch
  left join subscriptions s on s.channel_id = ch.id and s.user_id = $1::uuid
  left join lateral (
    select count(*) as jami from channel_vacancies cv where cv.channel_id = ch.id
  ) stat on true
  left join lateral (
    select count(*) as jami from subscriptions ss where ss.channel_id = ch.id
  ) subs on true
  left join lateral (
    select v.lavozim, c.nom as kompaniya, v.maosh_min, v.maosh_max,
           floor(extract(epoch from (now() - v.joylashtirilgan_sana)) / 60) as daqiqa
      from channel_vacancies cv
      join vacancies v on v.id = cv.vacancy_id
      join companies c on c.id = v.company_id
     where cv.channel_id = ch.id
     order by v.joylashtirilgan_sana desc
     limit 1
  ) oxirgi on true
`;

function mapChannel(row: ChannelRow): ChannelListItemDTO {
  return {
    id: row.id,
    name: localized(row.nom_uz, row.nom_uz_cyrl, row.nom_ru),
    group: row.guruh,
    subscribed: row.obuna,
    muted: row.ovozsiz,
    pinned: row.qadalgan,
    newCount: Number(row.yangi),
    vacancyCount: Number(row.vakansiyalar),
    subscriberCount: Number(row.obunachilar),
    last: row.oxirgi_lavozim
      ? {
          title: row.oxirgi_lavozim,
          company: row.oxirgi_kompaniya ?? "",
          salaryMin: row.oxirgi_maosh_min,
          salaryMax: row.oxirgi_maosh_max,
          minutesAgo: Number(row.oxirgi_daqiqa ?? 0),
        }
      : null,
  };
}

/**
 * "Ishlar" tabidagi ro'yxat — foydalanuvchi obuna bo'lgan kanallar.
 * Tartib: qadalganlar tepada, keyin oxirgi vakansiya vaqti bo'yicha —
 * ya'ni yangi vakansiya kelgan kanal o'z-o'zidan tepaga ko'tariladi.
 */
export async function listSubscribedChannels(userId: string): Promise<ChannelListItemDTO[]> {
  const rows = await query<ChannelRow>(
    `${CHANNEL_SELECT}
     where s.user_id is not null
     order by s.qadalgan desc, oxirgi.daqiqa asc nulls last, ch.tartib`,
    [userId],
  );
  return rows.map(mapChannel);
}

/**
 * Katalog — barcha kanallar, kasb guruhlari bo'yicha.
 * Bo'sh kanal (5 tadan kam vakansiya) ko'rsatilmaydi: bo'sh kanal o'lik
 * mahsulot taassurotini beradi.
 */
export async function listChannelCatalog(userId: string | null): Promise<ChannelGroupDTO[]> {
  // Guruhlar alifbo bo'yicha emas: birinchi kasbining tartibi bo'yicha.
  // Alifboda "Ishlab chiqarish" va "IT" tepaga chiqib qolardi, holbuki
  // eng ko'p ish savdo va ovqatlanishda.
  const rows = await query<ChannelRow>(
    `${CHANNEL_SELECT}
     where coalesce(stat.jami, 0) >= ${MIN_CHANNEL_VACANCIES}
     order by min(ch.tartib) over (partition by ch.guruh), ch.tartib`,
    [userId],
  );

  const groups: ChannelGroupDTO[] = [];
  for (const row of rows) {
    const channel = mapChannel(row);
    const last = groups[groups.length - 1];
    if (last && last.id === channel.group) last.channels.push(channel);
    else groups.push({ id: channel.group, channels: [channel] });
  }
  return groups;
}

/** Kanal ichi uchun sarlavha ma'lumoti va chip qatoridagi sonlar */
export async function getChannel(
  channelId: string,
  userId: string | null,
): Promise<ChannelDTO | null> {
  const row = await queryOne<ChannelRow>(`${CHANNEL_SELECT} where ch.id = $2`, [userId, channelId]);
  if (!row) return null;

  const counts = await query<{ bandlik_turi: EmploymentType; jami: string }>(
    `select v.bandlik_turi, count(*) as jami
       from channel_vacancies cv
       join vacancies v on v.id = cv.vacancy_id
      where cv.channel_id = $1
      group by v.bandlik_turi`,
    [channelId],
  );

  const employmentCounts: Partial<Record<EmploymentType, number>> = {};
  for (const item of counts) {
    if (EMPLOYMENT_TYPES.includes(item.bandlik_turi)) {
      employmentCounts[item.bandlik_turi] = Number(item.jami);
    }
  }

  const base = mapChannel(row);
  return {
    id: base.id,
    name: base.name,
    group: base.group,
    subscribed: base.subscribed,
    muted: base.muted,
    pinned: base.pinned,
    subscriberCount: base.subscriberCount,
    vacancyCount: base.vacancyCount,
    employmentCounts,
  };
}

/** Obunani almashtirish. Yangi holatni qaytaradi — optimistik UI uchun. */
export async function toggleSubscription(userId: string, channelId: string): Promise<boolean> {
  const deleted = await query<{ channel_id: string }>(
    "delete from subscriptions where user_id = $1 and channel_id = $2 returning channel_id",
    [userId, channelId],
  );
  if (deleted.length > 0) return false;

  await query(
    `insert into subscriptions (user_id, channel_id) values ($1, $2)
     on conflict (user_id, channel_id) do nothing`,
    [userId, channelId],
  );
  return true;
}

/** Birinchi kirishda tanlangan kasb kanaliga avtomatik obuna (§1.4) */
export async function subscribeToChannels(userId: string, channelIds: string[]): Promise<void> {
  if (channelIds.length === 0) return;
  await query(
    `insert into subscriptions (user_id, channel_id)
     select $1, unnest($2::text[])
     on conflict (user_id, channel_id) do nothing`,
    [userId, channelIds],
  );
}

/**
 * Kanal ochildi — "yangi" belgisi shu sanadan hisoblanadi.
 * Obuna bo'lmagan kanalda yozadigan qator yo'q, shuning uchun jim o'tadi.
 */
export async function markChannelSeen(userId: string, channelId: string): Promise<void> {
  await query(
    "update subscriptions set oxirgi_korilgan = now() where user_id = $1 and channel_id = $2",
    [userId, channelId],
  );
}

/** Uzoq bosish menyusi: ovozsiz qilish va tepaga qadash */
export async function setChannelFlags(
  userId: string,
  channelId: string,
  flags: { muted?: boolean; pinned?: boolean },
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [userId, channelId];
  if (flags.muted !== undefined) {
    params.push(flags.muted);
    sets.push(`ovozsiz = $${params.length}`);
  }
  if (flags.pinned !== undefined) {
    params.push(flags.pinned);
    sets.push(`qadalgan = $${params.length}`);
  }
  if (sets.length === 0) return;

  await query(
    `update subscriptions set ${sets.join(", ")} where user_id = $1 and channel_id = $2`,
    params,
  );
}

/** Tab bardagi belgi: obuna kanallardagi jami yangi vakansiyalar */
export async function newVacancyTotal(userId: string): Promise<number> {
  const row = await queryOne<{ jami: string }>(
    `select coalesce(sum(n), 0) as jami from (
       select (select count(*) from channel_vacancies cv
                where cv.channel_id = s.channel_id
                  and cv.joylashtirilgan_sana > s.oxirgi_korilgan) as n
         from subscriptions s
        where s.user_id = $1 and s.ovozsiz = false
     ) t`,
    [userId],
  );
  return Number(row?.jami ?? 0);
}
