import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Telegram Login Widget javobini tekshirish.
 *
 * Telegram hujjatiga ko'ra:
 *   secret_key = SHA256(bot_token)
 *   hash = HMAC_SHA256(data_check_string, secret_key)
 * data_check_string — "kalit=qiymat" juftliklari alifbo tartibida, \n bilan
 * birlashtirilgan (hash o'zi hisobga olinmaydi).
 */

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
};

/** Havola takror ishlatilmasligi uchun — Telegram tavsiyasi */
const MAX_AGE_SECONDS = 60 * 60 * 24;

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME);
}

/**
 * Namunaviy foydalanuvchi bilan kirish.
 * Telegram boti ulanmagan bo'lsa va ishlab chiqish rejimida — ochiq.
 * Ishlab chiqarish build'ida faqat ALLOW_DEV_LOGIN=1 bilan ataylab yoqiladi
 * (demo uchun; haqiqiy foydalanuvchilar bo'lgan joyda yoqmang).
 */
export function isDevLoginAllowed(): boolean {
  if (isTelegramConfigured()) return false;
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_LOGIN === "1";
}

export function verifyTelegramLogin(
  params: Record<string, string>,
): { ok: true; user: TelegramUser } | { ok: false; reason: string } {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, reason: "TELEGRAM_BOT_TOKEN berilmagan" };

  const { hash, ...rest } = params;
  if (!hash) return { ok: false, reason: "hash yo'q" };

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("\n");

  const secretKey = createHash("sha256").update(token).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const given = Buffer.from(hash, "hex");
  const computed = Buffer.from(expected, "hex");
  if (given.length !== computed.length || !timingSafeEqual(given, computed)) {
    return { ok: false, reason: "imzo mos kelmadi" };
  }

  const authDate = Number(rest.auth_date);
  if (!Number.isFinite(authDate)) return { ok: false, reason: "auth_date noto'g'ri" };
  if (Date.now() / 1000 - authDate > MAX_AGE_SECONDS) {
    return { ok: false, reason: "havola eskirgan" };
  }

  const id = Number(rest.id);
  if (!Number.isFinite(id)) return { ok: false, reason: "id noto'g'ri" };

  return {
    ok: true,
    user: {
      id,
      first_name: rest.first_name ?? "",
      last_name: rest.last_name,
      username: rest.username,
      photo_url: rest.photo_url,
      auth_date: authDate,
    },
  };
}
