import { NextResponse } from "next/server";
import { listSubscribedChannels } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** "Ishlar" tabi — obuna bo'lingan kanallar */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json([]);
  return NextResponse.json(await listSubscribedChannels(userId));
}
