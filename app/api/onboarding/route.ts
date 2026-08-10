import { NextResponse } from "next/server";
import { createMinimalCard, ensureCompany, setUserRole } from "@/lib/db/queries";
import { currentUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Ro'yxatdan o'tishni yakunlash — rol va eng kerakli maydonlar */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Kirilmagan" }, { status: 401 });

  const body = (await request.json()) as {
    role?: "nomzod" | "ish_beruvchi";
    professionId?: string;
    cityId?: string;
    companyName?: string;
    phone?: string;
  };

  if (body.role !== "nomzod" && body.role !== "ish_beruvchi") {
    return NextResponse.json({ error: "Rol tanlanmagan" }, { status: 400 });
  }

  await setUserRole(user.id, body.role);

  if (body.role === "nomzod") {
    if (!body.professionId || !body.cityId) {
      return NextResponse.json({ error: "Kasb va shahar kerak" }, { status: 400 });
    }
    await createMinimalCard(user.id, body.professionId, body.cityId);
    return NextResponse.json({ next: "/jobs" });
  }

  const name = body.companyName?.trim();
  if (!name) return NextResponse.json({ error: "Kompaniya nomi kerak" }, { status: 400 });

  await ensureCompany(user.id, name, body.phone?.trim() || null);
  return NextResponse.json({ next: "/employer/vacancies" });
}
