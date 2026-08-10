import { AppTabBar } from "@/components/app/app-tab-bar";
import { listChats } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Tab bar bilan ekranlar: Ishlar / Xabarlar / Saqlangan / Profil */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await currentUserId();
  const chats = userId ? await listChats(userId) : [];
  const unread = chats.reduce((sum, chat) => sum + chat.unread, 0);

  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="pb-[calc(58px+env(safe-area-inset-bottom))]">{children}</div>
      <AppTabBar unread={unread} />
    </div>
  );
}
