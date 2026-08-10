import { redirect } from "next/navigation";
import { currentUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Kirmagan bo'lsa — kirish ekrani, aks holda roliga mos bosh ekran */
export default async function Home() {
  const user = await currentUser();
  if (!user) redirect("/kirish");
  if (user.role === "ish_beruvchi") redirect("/employer/vacancies");
  redirect("/jobs");
}
