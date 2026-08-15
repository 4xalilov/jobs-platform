import { NextResponse } from "next/server";
import { markChannelSeen } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Kanal ochildi — "yangi" belgisi shu sanadan hisoblanadi */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  await markChannelSeen(userId, id);
  return NextResponse.json({ ok: true });
}
