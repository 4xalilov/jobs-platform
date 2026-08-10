import { NextResponse } from "next/server";
import { applyToVacancy } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Bir bosishda ariza — forma yo'q, javobda ochilgan chat qaytadi */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const { id } = await params;
  const result = await applyToVacancy(userId, id);
  return NextResponse.json(result, { status: 201 });
}
