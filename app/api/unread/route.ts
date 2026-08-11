import { NextResponse } from "next/server";
import { unreadTotal, unreadTotalForCompany } from "@/lib/db/queries";
import { currentUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Tab bardagi o'qilmagan belgisi — rolga qarab hisoblanadi */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const count =
    user.role === "ish_beruvchi"
      ? user.companyId
        ? await unreadTotalForCompany(user.companyId)
        : 0
      : await unreadTotal(user.id);

  return NextResponse.json({ count });
}
