import "server-only";
import { query, queryOne } from "./client";

export type PushDevice = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Qurilmani saqlash.
 *
 * Kalit — endpoint, chunki brauzer har qurilmaga boshqa manzil beradi.
 * Bitta odamda telefon ham, kompyuter ham bo'lishi mumkin va ikkalasi
 * ham xabar olishi kerak. Endpoint takrorlansa (brauzer obunani
 * yangilagan bo'lsa) kalitlar ustiga yoziladi.
 */
export async function savePushDevice(userId: string, device: PushDevice): Promise<void> {
  await query(
    `insert into push_subscriptions (endpoint, user_id, p256dh, auth)
     values ($1, $2, $3, $4)
     on conflict (endpoint) do update
       set user_id = excluded.user_id,
           p256dh = excluded.p256dh,
           auth = excluded.auth`,
    [device.endpoint, userId, device.p256dh, device.auth],
  );
}

export async function removePushDevice(endpoint: string): Promise<void> {
  await query(`delete from push_subscriptions where endpoint = $1`, [endpoint]);
}

/** Foydalanuvchining barcha qurilmalari */
export async function pushDevicesOf(userId: string): Promise<PushDevice[]> {
  return query<PushDevice>(
    `select endpoint, p256dh, auth from push_subscriptions where user_id = $1`,
    [userId],
  );
}

export async function hasPushDevice(userId: string): Promise<boolean> {
  const row = await queryOne<{ bor: boolean }>(
    `select exists (select 1 from push_subscriptions where user_id = $1) as bor`,
    [userId],
  );
  return Boolean(row?.bor);
}

/** Yig'ma xabar soati (0–23, mahalliy vaqt) */
export async function digestHourOf(userId: string): Promise<number> {
  const row = await queryOne<{ digest_soati: number }>(
    `select digest_soati from users where id = $1`,
    [userId],
  );
  return row?.digest_soati ?? 9;
}

export async function setDigestHour(userId: string, hour: number): Promise<void> {
  await query(`update users set digest_soati = $2 where id = $1`, [userId, hour]);
}

export type DigestChannel = {
  channelId: string;
  nom: string;
  yangi: number;
};

export type Digest = {
  userId: string;
  locale: "uz" | "uz-cyrl" | "ru";
  channels: DigestChannel[];
  devices: PushDevice[];
};

/**
 * Kimga hozir yig'ma xabar borishi kerak.
 *
 * Uch shart: qurilma ro'yxatdan o'tgan, hozir shu odamning soati va
 * bugun hali yubormaganmiz. Uchinchisi muhim — vazifa soatiga bir
 * necha marta ishga tushsa ham odam bitta xabar oladi.
 *
 * `oxirgi_korilgan` bu yerda o'zgartirilmaydi: odam ilovani ochganda
 * belgi hali ham "yangi" ni ko'rsatishi kerak, aks holda xabar
 * o'zi olib kelgan narsani o'chirib yuborardi.
 */
export async function dueDigests(nowUtc: Date): Promise<Digest[]> {
  const rows = await query<{
    user_id: string;
    til: string;
    channel_id: string;
    nom_uz: string;
    nom_uz_cyrl: string;
    nom_ru: string;
    yangi: string;
  }>(
    `with kunduzgi as (
       select u.id, u.til
         from users u
        where u.digest_soati = $1
          and exists (select 1 from push_subscriptions p where p.user_id = u.id)
          and (u.oxirgi_digest is null or u.oxirgi_digest < $2)
     )
     select k.id as user_id,
            k.til,
            ch.id as channel_id,
            ch.nom_uz, ch.nom_uz_cyrl, ch.nom_ru,
            count(cv.vacancy_id) as yangi
       from kunduzgi k
       join subscriptions s on s.user_id = k.id and s.ovozsiz = false
       join channels ch on ch.id = s.channel_id
       join channel_vacancies cv
         on cv.channel_id = s.channel_id
        and cv.joylashtirilgan_sana > s.oxirgi_korilgan
      group by k.id, k.til, ch.id, ch.nom_uz, ch.nom_uz_cyrl, ch.nom_ru
     having count(cv.vacancy_id) > 0
      order by k.id, count(cv.vacancy_id) desc`,
    [localHour(nowUtc), startOfLocalDay(nowUtc)],
  );

  const byUser = new Map<string, Digest>();
  for (const row of rows) {
    const locale = normalizeLocale(row.til);
    let entry = byUser.get(row.user_id);
    if (!entry) {
      entry = { userId: row.user_id, locale, channels: [], devices: [] };
      byUser.set(row.user_id, entry);
    }
    entry.channels.push({
      channelId: row.channel_id,
      nom: locale === "ru" ? row.nom_ru : locale === "uz-cyrl" ? row.nom_uz_cyrl : row.nom_uz,
      yangi: Number(row.yangi),
    });
  }

  for (const entry of byUser.values()) {
    entry.devices = await pushDevicesOf(entry.userId);
  }

  return [...byUser.values()].filter((entry) => entry.devices.length > 0);
}

export async function markDigestSent(userId: string, at: Date): Promise<void> {
  await query(`update users set oxirgi_digest = $2 where id = $1`, [userId, at]);
}

/*
 * O'zbekiston butunlay UTC+5 da va yozgi vaqt yo'q, shuning uchun
 * mahalliy soat oddiy qo'shish bilan chiqadi. Zona kutubxonasi
 * kiritilsa faqat og'irlik qo'shilardi.
 */
const UZ_OFFSET_HOURS = 5;

function localHour(nowUtc: Date): number {
  return (nowUtc.getUTCHours() + UZ_OFFSET_HOURS) % 24;
}

/** Mahalliy kun boshlanishi — UTC da ifodalangan */
function startOfLocalDay(nowUtc: Date): Date {
  const local = new Date(nowUtc.getTime() + UZ_OFFSET_HOURS * 3_600_000);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnight - UZ_OFFSET_HOURS * 3_600_000);
}

function normalizeLocale(value: string | null): "uz" | "uz-cyrl" | "ru" {
  if (value === "ru" || value === "uz-cyrl") return value;
  return "uz";
}
