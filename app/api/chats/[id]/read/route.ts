import { NextResponse } from "next/server";
import { chatSide, markChatRead } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Chat ochilganda chaqiriladi — qarshi tomon xabarlari o'qilgan bo'ladi */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  const me = userId ? await chatSide(id, userId) : null;
  if (!me) return NextResponse.json({ error: "Chat topilmadi" }, { status: 404 });

  await markChatRead(id, me);
  return NextResponse.json({ ok: true });
}
