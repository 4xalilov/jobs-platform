import { NextResponse } from "next/server";
import { getChat } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const { id } = await params;
  const chat = await getChat(id, userId);
  if (!chat) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(chat);
}
