import { NextResponse } from "next/server";
import { listProfessions } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listProfessions());
}
