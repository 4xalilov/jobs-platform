import { NextResponse } from "next/server";
import { getCard, saveCard } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";
import type { CardDTO } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });
  return NextResponse.json(await getCard(userId));
}

/** Kartochka — 5 maydon, hammasi bitta so'rovda saqlanadi */
export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const body = (await request.json()) as Omit<CardDTO, "id">;
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
  }

  await saveCard(userId, body);
  return NextResponse.json(await getCard(userId));
}
