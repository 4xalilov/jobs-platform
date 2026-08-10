"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { CountBadge } from "@/components/ui/badge";
import { IconBriefcase, IconCard, IconUser, IconUsers } from "@/components/ui/icon";
import { candidates } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type EmployerTab = "vacancies" | "candidates" | "plans" | "profile";

const ROUTES: Record<EmployerTab, string> = {
  vacancies: "/employer/vacancies",
  candidates: "/employer/candidates",
  plans: "/employer/plans",
  profile: "/employer/profile",
};

const ICONS = {
  vacancies: IconBriefcase,
  candidates: IconUsers,
  plans: IconCard,
  profile: IconUser,
};

function activeTab(pathname: string): EmployerTab {
  if (pathname.startsWith("/employer/candidates")) return "candidates";
  if (pathname.startsWith("/employer/plans")) return "plans";
  if (pathname.startsWith("/employer/profile")) return "profile";
  return "vacancies";
}

/** Ish beruvchi uchun pastdagi 4 ta bo'lim */
export function EmployerTabBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const unread = candidates.reduce((sum, candidate) => sum + candidate.unread, 0);
  const active = activeTab(pathname);
  const tabs: EmployerTab[] = ["vacancies", "candidates", "plans", "profile"];

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2">
      <nav className="flex border-t border-separator bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        {tabs.map((tab) => {
          const TabIcon = ICONS[tab];
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(ROUTES[tab])}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors duration-100",
                isActive ? "text-accent" : "text-text-tertiary",
              )}
            >
              <span className="relative">
                <TabIcon size={26} />
                {tab === "candidates" && unread > 0 && (
                  <CountBadge
                    count={unread}
                    className="absolute -top-1 -right-2.5 border-2 border-surface"
                  />
                )}
              </span>
              <span className="text-[10px] leading-[12px] font-medium">
                {t.employer.tabs[tab]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
