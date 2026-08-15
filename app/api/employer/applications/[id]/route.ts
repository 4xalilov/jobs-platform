import { NextResponse } from "next/server";
import { decideApplication } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Chapga tortsa rad etish, o'ngga tortsa chaqirish */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await currentCompanyId();
  if (!companyId) return NextResponse.json({ error: "Kompaniya topilmadi" }, { status: 401 });

  const { decision } = (await request.json()) as { decision?: string };
  if (decision !== "rad_etildi" && decision !== "qabul_qilindi") {
    return NextResponse.json({ error: "Qaror noto'g'ri" }, { status: 400 });
  }

  const { id } = await params;
  const ok = await decideApplication(companyId, id, decision);
  if (!ok) return NextResponse.json({ error: "Ariza topilmadi" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
