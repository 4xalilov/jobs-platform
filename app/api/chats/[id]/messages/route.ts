import { NextResponse } from "next/server";
import { chatSide, markChatRead, messagesSince, sendMessage } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/**
 * Bitta yo'l ikkala tomonga xizmat qiladi — nomzod ham, ish beruvchi ham.
 * Kim yozayotgani so'rovda emas, bazadagi bog'lanishda aniqlanadi, ya'ni
 * o'zini boshqa tomon qilib ko'rsatib bo'lmaydi.
 */
async function side(chatId: string) {
  const userId = await currentUserId();
  if (!userId) return null;
  return chatSide(chatId, userId);
}

/** Yangi xabarlarni olish: ?since=<ISO>. `since` bo'lmasa — hammasi. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await side(id);
  if (!me) return NextResponse.json({ error: "Chat topilmadi" }, { status: 404 });

  const since = new URL(request.url).searchParams.get("since");
  return NextResponse.json(await messagesSince(id, me, since));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await side(id);
  if (!me) return NextResponse.json({ error: "Chat topilmadi" }, { status: 404 });

  const body = (await request.json()) as {
    text?: string;
    audioId?: string;
    durationMs?: number;
  };

  if (!body.text?.trim() && !body.audioId) {
    return NextResponse.json({ error: "Bo'sh xabar" }, { status: 400 });
  }

  // Yozayotgan odam ekranni ochib turibdi — kelgan xabarlar o'qilgan
  await markChatRead(id, me);

  return NextResponse.json(
    await sendMessage(id, me, {
      text: body.text,
      audioId: body.audioId,
      durationMs: body.durationMs,
    }),
  );
}
