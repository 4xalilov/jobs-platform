import { CandidateList } from "@/components/employer/candidate-list";
import { listCandidates } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const companyId = await currentCompanyId();
  const candidates = companyId ? await listCandidates(companyId) : [];
  return <CandidateList candidates={candidates} />;
}
