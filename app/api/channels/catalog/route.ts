import { NextResponse } from "next/server";
import { listChannelCatalog } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Katalog — obunasiz ham ochiladi */
export async function GET() {
  const userId = await currentUserId();
  return NextResponse.json(await listChannelCatalog(userId));
}
