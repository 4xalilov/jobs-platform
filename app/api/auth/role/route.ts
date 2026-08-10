import { NextResponse } from "next/server";
import { ensureCompany, setUserRole } from "@/lib/db/queries";
import { currentUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Rolni almashtirish — users.rol ustuniga yoziladi */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Kirilmagan" }, { status: 401 });

  const body = (await request.json()) as { role?: "nomzod" | "ish_beruvchi"; companyName?: string };
  if (body.role !== "nomzod" && body.role !== "ish_beruvchi") {
    return NextResponse.json({ error: "Rol noto'g'ri" }, { status: 400 });
  }

  await setUserRole(user.id, body.role);

  // Ish beruvchida kompaniya bo'lishi shart
  if (body.role === "ish_beruvchi" && !user.companyId) {
    const name = body.companyName?.trim();
    if (!name) return NextResponse.json({ next: "/boshlash" });
    await ensureCompany(user.id, name, null);
  }

  return NextResponse.json({ next: body.role === "nomzod" ? "/jobs" : "/employer/vacancies" });
}
