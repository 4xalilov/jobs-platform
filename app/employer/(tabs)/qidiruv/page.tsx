import { OpenCandidateList } from "@/components/employer/open-candidate-list";
import { listOpenCandidates, listProfessions } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** "Ish qidiryapman" belgisini yoqqan nomzodlar */
export default async function OpenCandidatesPage() {
  await requireUser();
  const [candidates, professions] = await Promise.all([
    listOpenCandidates({ limit: 50 }),
    listProfessions(),
  ]);

  return <OpenCandidateList candidates={candidates} professions={professions} />;
}
