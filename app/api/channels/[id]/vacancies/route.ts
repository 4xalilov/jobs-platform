import { NextResponse } from "next/server";
import { listVacancies } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Kanal ichidagi oqim — bandlik chipi va keyset sahifalash bilan */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const userId = await currentUserId();

  return NextResponse.json(
    await listVacancies({
      userId,
      channelId: id,
      employment: url.searchParams.get("bandlik"),
      cursor: url.searchParams.get("cursor"),
      limit: 12,
    }),
  );
}
