import "server-only";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { getAuthUser, type AuthUser } from "./queries";

/** Joriy foydalanuvchi — sessiya cookie'sidan */
export async function currentUser(): Promise<AuthUser | null> {
  const userId = await readSession();
  if (!userId) return null;
  return getAuthUser(userId);
}

export async function currentUserId(): Promise<string | null> {
  return (await currentUser())?.id ?? null;
}

/**
 * Himoyalangan ekranlar uchun.
 * Kirmagan bo'lsa — kirish sahifasiga, ro'yxatdan o'tmagan bo'lsa —
 * tanishtiruv ekraniga yuboradi.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await currentUser();
  if (!user) redirect("/kirish");
  if (user.role === "nomzod" && !user.hasCard) redirect("/boshlash");
  if (user.role === "ish_beruvchi" && !user.companyId) redirect("/boshlash");
  return user;
}

/** Ish beruvchi ekranlari uchun joriy kompaniya */
export async function currentCompanyId(): Promise<string | null> {
  return (await currentUser())?.companyId ?? null;
}
