import { EmployerTabBar } from "@/components/app/employer-tab-bar";
import { listCandidates } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Ish beruvchi ekranlari: Vakansiyalar / Nomzodlar / Tariflar / Profil */
export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const companyId = await currentCompanyId();
  const candidates = companyId ? await listCandidates(companyId) : [];
  const unread = candidates.reduce((sum, candidate) => sum + candidate.unread, 0);

  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="pb-[calc(58px+env(safe-area-inset-bottom))]">{children}</div>
      <EmployerTabBar unread={unread} />
    </div>
  );
}
