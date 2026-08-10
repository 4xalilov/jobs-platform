import { NextResponse } from "next/server";
import { listChats } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json([]);
  return NextResponse.json(await listChats(userId));
}
