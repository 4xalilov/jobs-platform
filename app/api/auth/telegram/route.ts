import { NextResponse, type NextRequest } from "next/server";
import { createSession } from "@/lib/auth/session";
import { verifyTelegramLogin } from "@/lib/auth/telegram";
import { upsertTelegramUser } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/**
 * Telegram Login Widget shu manzilga qaytaradi (data-auth-url).
 * Imzo tekshirilgach sessiya ochiladi.
 */
export async function GET(request: NextRequest) {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = verifyTelegramLogin(params);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/kirish?xato=${encodeURIComponent(result.reason)}`, request.url));
  }

  const user = await upsertTelegramUser({
    telegramId: result.user.id,
    firstName: result.user.first_name,
    lastName: result.user.last_name,
    username: result.user.username,
    photoUrl: result.user.photo_url,
  });

  await createSession(user.id);

  const target = user.hasCard || user.companyId ? "/jobs" : "/boshlash";
  return NextResponse.redirect(new URL(target, request.url));
}
