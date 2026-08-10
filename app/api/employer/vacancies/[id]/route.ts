import { NextResponse } from "next/server";
import { deleteVacancy } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await currentCompanyId();
  if (!companyId) return NextResponse.json({ error: "Kompaniya topilmadi" }, { status: 401 });

  const { id } = await params;
  await deleteVacancy(companyId, id);
  return NextResponse.json({ ok: true });
}
