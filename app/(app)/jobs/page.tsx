import { JobsFeed } from "@/components/jobs/jobs-feed";
import { listProfessions, listVacancies } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

// Ro'yxat har safar bazadan olinadi
export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ saqlangan?: string }>;
}) {
  const { saqlangan } = await searchParams;
  const savedOnly = saqlangan === "1";

  const userId = await currentUserId();
  const [page, professions] = await Promise.all([
    listVacancies({ userId, limit: 12, savedOnly }),
    listProfessions(),
  ]);

  return <JobsFeed initial={page} professions={professions} initialSavedOnly={savedOnly} />;
}
