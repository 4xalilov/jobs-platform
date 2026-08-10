import { EmployerTabBar } from "@/components/app/employer-tab-bar";

/** Ish beruvchi ekranlari: Vakansiyalar / Nomzodlar / Tariflar / Profil */
export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="pb-[calc(58px+env(safe-area-inset-bottom))]">{children}</div>
      <EmployerTabBar />
    </div>
  );
}
