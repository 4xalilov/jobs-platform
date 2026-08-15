import { NextResponse } from "next/server";
import { createVacancy, listEmployerVacancies, listProfessions } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";
import { REQUIREMENT_KEYS, type RequirementKey } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const companyId = await currentCompanyId();
  if (!companyId) return NextResponse.json([]);
  return NextResponse.json(await listEmployerVacancies(companyId));
}

/** v2: 5 maydonli formaning natijasi shu yerga keladi */
export async function POST(request: Request) {
  const companyId = await currentCompanyId();
  if (!companyId) return NextResponse.json({ error: "Kompaniya topilmadi" }, { status: 401 });

  const body = (await request.json()) as {
    professionId?: string;
    /** v2: lavozim ro'yxatdan yoki yozib kiritiladi */
    title?: string;
    cityId?: string;
    districtId?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    employment?: "full" | "part" | "shift" | "temporary";
    description?: string;
    requirements?: string[];
  };

  if (!body.professionId || !body.cityId) {
    return NextResponse.json({ error: "Kasb va shahar kerak" }, { status: 400 });
  }

  const professions = await listProfessions();
  const profession = professions.find((item) => item.id === body.professionId);
  if (!profession) return NextResponse.json({ error: "Kasb topilmadi" }, { status: 400 });

  // Ro'yxatdagi kalitlardan boshqasi qabul qilinmaydi, 3 tadan oshmaydi
  const requirements = (body.requirements ?? [])
    .filter((key): key is RequirementKey => REQUIREMENT_KEYS.includes(key as RequirementKey))
    .slice(0, 3);

  const id = await createVacancy({
    companyId,
    professionId: body.professionId,
    title: body.title?.trim() || profession.name.uz,
    cityId: body.cityId,
    districtId: body.districtId ?? null,
    salaryMin: body.salaryMin ?? null,
    salaryMax: body.salaryMax ?? null,
    employment: body.employment ?? "full",
    description: body.description ?? "",
    requirements,
  });

  return NextResponse.json({ id }, { status: 201 });
}
