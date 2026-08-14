import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** v2: Saqlangan alohida bo'lim emas — Ishlar ichidagi filtr */
export default function SavedPage() {
  redirect("/jobs?saqlangan=1");
}
