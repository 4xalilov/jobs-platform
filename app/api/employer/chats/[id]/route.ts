import { NextResponse } from "next/server";
import { getEmployerChat } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await currentCompanyId();
  if (!companyId) return NextResponse.json({ error: "Kompaniya topilmadi" }, { status: 401 });

  const { id } = await params;
  const chat = await getEmployerChat(id, companyId);
  if (!chat) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(chat);
}
