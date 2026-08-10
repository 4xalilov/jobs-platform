import { NextResponse } from "next/server";
import { toggleSaved } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const { id } = await params;
  const saved = await toggleSaved(userId, id);
  return NextResponse.json({ saved });
}
