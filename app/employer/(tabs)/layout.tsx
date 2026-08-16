import { EmployerTabBar } from "@/components/app/employer-tab-bar";
import { OfflineBanner } from "@/components/app/offline-banner";
import { unreadTotalForCompany } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Ish beruvchi ekranlari: Vakansiyalar / Nomzodlar / Tariflar / Profil */
export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = user.companyId ? await unreadTotalForCompany(user.companyId) : 0;

  return (
    <div className="mx-auto min-h-dvh max-w-[27.5rem] bg-bg">
      <OfflineBanner />
      <div className="pb-[calc(3.625rem+env(safe-area-inset-bottom))]">{children}</div>
      <EmployerTabBar unread={unread} />
    </div>
  );
}
