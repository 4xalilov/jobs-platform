import { NextResponse } from "next/server";
import { toggleSubscription } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Obunani almashtirish — yangi holat qaytadi, optimistik UI uchun */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Kirilmagan" }, { status: 401 });
  return NextResponse.json({ subscribed: await toggleSubscription(userId, id) });
}
