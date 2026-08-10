import { NextResponse } from "next/server";
import { listCities } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listCities());
}
