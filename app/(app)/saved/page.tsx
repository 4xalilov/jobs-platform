import { SavedList } from "@/components/jobs/saved-list";
import { listSavedVacancies } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/**
 * v4: "Saqlangan" Ishlar ichidagi filtr emas — Ishlar tabi endi
 * kanallar ro'yxati, u yerda filtrga joy yo'q. Profil ichidan ochiladi.
 */
export default async function SavedPage() {
  const user = await requireUser();
  return <SavedList initial={await listSavedVacancies(user.id)} />;
}
