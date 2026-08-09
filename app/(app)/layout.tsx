import { AppTabBar } from "@/components/app/app-tab-bar";

/** Tab bar bilan ekranlar: Ishlar / Xabarlar / Saqlangan / Profil */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="pb-[calc(58px+env(safe-area-inset-bottom))]">{children}</div>
      <AppTabBar />
    </div>
  );
}
