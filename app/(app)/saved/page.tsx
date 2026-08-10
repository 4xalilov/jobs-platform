import { SavedList } from "@/components/jobs/saved-list";
import { listSavedVacancies } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const userId = await currentUserId();
  const vacancies = userId ? await listSavedVacancies(userId) : [];
  return <SavedList initial={vacancies} />;
}
