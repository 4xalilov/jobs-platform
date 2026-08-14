"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { CountBadge } from "@/components/ui/badge";
import {
  IconBriefcase,
  IconBriefcaseSolid,
  IconCard,
  IconCardSolid,
  IconUser,
  IconUserSolid,
  IconUsers,
  IconUsersSolid,
  type IconProps,
} from "@/components/ui/icon";
import { useUnread } from "@/lib/use-unread";
import { cn } from "@/lib/utils";

type EmployerTab = "vacancies" | "candidates" | "plans" | "profile";

const ROUTES: Record<EmployerTab, string> = {
  vacancies: "/employer/vacancies",
  candidates: "/employer/candidates",
  plans: "/employer/plans",
  profile: "/employer/profile",
};

type IconPair = {
  line: (p: IconProps) => React.ReactElement;
  solid: (p: IconProps) => React.ReactElement;
};

/** Faol tab to'ldirilgan variantga o'tadi */
const ICONS: Record<EmployerTab, IconPair> = {
  vacancies: { line: IconBriefcase, solid: IconBriefcaseSolid },
  candidates: { line: IconUsers, solid: IconUsersSolid },
  plans: { line: IconCard, solid: IconCardSolid },
  profile: { line: IconUser, solid: IconUserSolid },
};

function activeTab(pathname: string): EmployerTab {
  if (pathname.startsWith("/employer/candidates")) return "candidates";
  if (pathname.startsWith("/employer/plans")) return "plans";
  if (pathname.startsWith("/employer/profile")) return "profile";
  return "vacancies";
}

/** Ish beruvchi uchun pastdagi 4 ta bo'lim */
export function EmployerTabBar({ unread = 0 }: { unread?: number }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const live = useUnread(unread);

  const active = activeTab(pathname);
  const tabs: EmployerTab[] = ["vacancies", "candidates", "plans", "profile"];

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2">
      <nav className="hairline-top relative flex bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = tab === active;
          const TabIcon = isActive ? ICONS[tab].solid : ICONS[tab].line;
          return (
            <button
              key={tab}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(ROUTES[tab])}
              className={cn(
                "tap relative flex h-[50px] flex-1 flex-col items-center justify-center gap-0.5",
                isActive ? "text-accent" : "text-text-secondary",
              )}
            >
              <span className="relative">
                <TabIcon size={26} />
                {tab === "candidates" && live > 0 && (
                  <CountBadge
                    count={live}
                    className="absolute -top-1 -right-2.5 border-2 border-surface"
                  />
                )}
              </span>
              <span className="text-[10px] leading-[12px] font-medium">{t.employer.tabs[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
