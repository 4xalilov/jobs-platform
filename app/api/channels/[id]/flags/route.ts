import { NextResponse } from "next/server";
import { setChannelFlags } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Uzoq bosish menyusi: ovozsiz qilish va tepaga qadash */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json()) as { muted?: boolean; pinned?: boolean };
  await setChannelFlags(userId, id, {
    muted: typeof body.muted === "boolean" ? body.muted : undefined,
    pinned: typeof body.pinned === "boolean" ? body.pinned : undefined,
  });
  return NextResponse.json({ ok: true });
}
