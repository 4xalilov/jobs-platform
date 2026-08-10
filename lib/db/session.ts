import "server-only";
import { cookies } from "next/headers";
import { queryOne } from "./client";

/**
 * Vaqtinchalik sessiya.
 *
 * 5-bosqichda Telegram Login Widget bilan almashtiriladi. Hozircha
 * foydalanuvchi cookie'dan yoki DEV_USER_ID dan olinadi, ular bo'lmasa
 * namunaviy ma'lumotlardagi birinchi nomzod ishlatiladi.
 */

export const USER_COOKIE = "ish_user";
export const COMPANY_COOKIE = "ish_company";

async function fallbackUserId(rol: "nomzod" | "ish_beruvchi"): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    "select id from users where rol = $1 order by yaratilgan_sana limit 1",
    [rol],
  );
  return row?.id ?? null;
}

export async function currentUserId(): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get(USER_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  if (process.env.DEV_USER_ID) return process.env.DEV_USER_ID;
  return fallbackUserId("nomzod");
}

/** Ish beruvchi tomoni uchun joriy kompaniya */
export async function currentCompanyId(): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get(COMPANY_COOKIE)?.value;
  if (fromCookie) return fromCookie;

  // Namunaviy ma'lumotlarda arizalar Chorsu Market'ga tegishli — demo shu
  // kompaniyadan boshlanadi, topilmasa birinchisi olinadi.
  const row = await queryOne<{ id: string }>(
    "select id from companies order by (nom = 'Chorsu Market') desc, nom limit 1",
  );
  return row?.id ?? null;
}
