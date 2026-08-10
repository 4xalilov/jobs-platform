import { NextResponse } from "next/server";
import { getVacancy, incrementViews } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vacancy = await getVacancy(id, await currentUserId());
  if (!vacancy) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await incrementViews(id);
  return NextResponse.json(vacancy);
}
