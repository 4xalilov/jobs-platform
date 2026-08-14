import { NextResponse, type NextRequest } from "next/server";
import { listVacancies, type VacancySort } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

const SORTS: VacancySort[] = ["new", "nearby", "salary"];

function parseNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Vakansiyalar ro'yxati — filtr, saralash va keyset sahifalash bilan */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sortParam = params.get("sort");
  const sort = SORTS.includes(sortParam as VacancySort) ? (sortParam as VacancySort) : "new";

  const page = await listVacancies({
    userId: await currentUserId(),
    professionId: params.get("kasb"),
    cityId: params.get("shahar"),
    search: params.get("q"),
    sort,
    cursor: params.get("cursor"),
    limit: Math.min(Number(params.get("limit")) || 12, 50),
    lat: parseNumber(params.get("lat")),
    lng: parseNumber(params.get("lng")),
    savedOnly: params.get("saqlangan") === "1",
  });

  return NextResponse.json(page);
}
