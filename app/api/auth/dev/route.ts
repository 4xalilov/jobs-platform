import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { isDevLoginAllowed } from "@/lib/auth/telegram";
import { findDemoUser } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/**
 * Mahalliy sinov uchun kirish.
 * Telegram boti sozlangan bo'lsa yoki ishlab chiqarishda — o'chirilgan.
 */
export async function POST() {
  if (!isDevLoginAllowed()) {
    return NextResponse.json({ error: "O'chirilgan" }, { status: 403 });
  }

  const user = await findDemoUser();
  if (!user) return NextResponse.json({ error: "Namunaviy foydalanuvchi yo'q" }, { status: 404 });

  await createSession(user.id);
  return NextResponse.json({ next: user.hasCard || user.companyId ? "/jobs" : "/boshlash" });
}
