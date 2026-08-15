import { NextResponse } from "next/server";
import { getChannel } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  const channel = await getChannel(id, userId);
  if (!channel) return NextResponse.json({ error: "Kanal topilmadi" }, { status: 404 });
  return NextResponse.json(channel);
}
