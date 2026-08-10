import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sessiya cookie'si: `userId.expiry.signature`.
 *
 * JWT kutubxonasi qo'shilmadi — bizga faqat imzolangan foydalanuvchi id
 * kerak, buni HMAC bilan qilish yetarli va shaffofroq.
 */

export const SESSION_COOKIE = "ish_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 kun

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET berilmagan. Ishlab chiqarishda sessiyani imzolash uchun " +
        "u majburiy — .env.example ga qarang.",
    );
  }
  // Mahalliy ishlab chiqishda barqaror, lekin sir bo'lmagan kalit
  return "ish-top-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function createSession(userId: string): Promise<void> {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiry}`;
  const store = await cookies();

  store.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;

  const [userId, expiry, signature] = parts;
  if (!safeEqual(signature, sign(`${userId}.${expiry}`))) return null;
  if (Number(expiry) < Date.now()) return null;

  return userId;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
