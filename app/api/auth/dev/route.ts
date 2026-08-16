import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { isDevLoginAllowed } from "@/lib/auth/telegram";
import { DatabaseError } from "@/lib/db/client";
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

  /*
   * Bu — yangi kelgan odam bosadigan birinchi tugma, ya'ni baza
   * ko'tarilmagani shu yerda bilinadi. Xato yutilib ketsa brauzerda
   * bo'sh 500 chiqardi va sababi faqat terminalda qolardi.
   */
  let user;
  try {
    user = await findDemoUser();
  } catch (error) {
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  if (!user) {
    return NextResponse.json(
      { error: "Namunaviy foydalanuvchi yo'q. `npm run setup` ni ishlatib ko'ring." },
      { status: 404 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ next: user.hasCard || user.companyId ? "/jobs" : "/boshlash" });
}
