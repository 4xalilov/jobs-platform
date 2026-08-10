import { EmployerTabBar } from "@/components/app/employer-tab-bar";
import { listCandidates } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Ish beruvchi ekranlari: Vakansiyalar / Nomzodlar / Tariflar / Profil */
export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const candidates = user.companyId ? await listCandidates(user.companyId) : [];
  const unread = candidates.reduce((sum, candidate) => sum + candidate.unread, 0);

  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="pb-[calc(58px+env(safe-area-inset-bottom))]">{children}</div>
      <EmployerTabBar unread={unread} />
    </div>
  );
}
