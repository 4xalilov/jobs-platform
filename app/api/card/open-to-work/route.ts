import { NextResponse } from "next/server";
import { setOpenToWork } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** "Ish qidiryapman" tugmasi va ko'rinish darajasi */
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

  const body = (await request.json()) as { openToWork?: boolean; visibility?: string };
  const visibility = body.visibility === "hamma" ? "hamma" : "ish_beruvchilar";

  await setOpenToWork(userId, Boolean(body.openToWork), visibility);
  return NextResponse.json({ ok: true });
}
