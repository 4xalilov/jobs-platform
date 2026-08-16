import { NextResponse } from "next/server";
import { removePushDevice } from "@/lib/db/push";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/**
 * Obunani bekor qilish.
 *
 * Faqat endpoint kerak — u qurilma kaliti. Chiqishda ham shu yo'l
 * chaqiriladi, aks holda telefon almashgan odamga eski xabarlar
 * kelib turardi.
 */
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const { endpoint } = (await request.json()) as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ ok: false }, { status: 400 });

  await removePushDevice(endpoint);
  return NextResponse.json({ ok: true });
}
