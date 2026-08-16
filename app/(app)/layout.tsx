import { AppTabBar } from "@/components/app/app-tab-bar";
import shell from "@/components/app/shell.module.scss";
import { OfflineBanner } from "@/components/app/offline-banner";
import { unreadTotal } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Tab bar bilan ekranlar: Ishlar / Xabarlar / Saqlangan / Profil */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await unreadTotal(user.id);

  return (
    <div className={shell.shell}>
      <OfflineBanner />
      <div className={shell.content}>{children}</div>
      <AppTabBar unread={unread} />
    </div>
  );
}
