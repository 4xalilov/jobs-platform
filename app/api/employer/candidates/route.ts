import { NextResponse } from "next/server";
import { listCandidates } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const companyId = await currentCompanyId();
  if (!companyId) return NextResponse.json([]);
  return NextResponse.json(await listCandidates(companyId));
}
