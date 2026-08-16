"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import shell from "@/components/app/shell.module.scss";
import { CountBadge } from "@/components/ui/badge";
import {
  IconBriefcase,
  IconBriefcaseSolid,
  IconSearch,
  IconSearchSolid,
  IconUser,
  IconUserSolid,
  IconUsers,
  IconUsersSolid,
  type IconProps,
} from "@/components/ui/icon";
import { useUnread } from "@/lib/use-unread";
import { cx } from "@/lib/utils";

type EmployerTab = "vacancies" | "candidates" | "search" | "profile";

const ROUTES: Record<EmployerTab, string> = {
  vacancies: "/employer/vacancies",
  candidates: "/employer/candidates",
  search: "/employer/qidiruv",
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
  search: { line: IconSearch, solid: IconSearchSolid },
  profile: { line: IconUser, solid: IconUserSolid },
};

function activeTab(pathname: string): EmployerTab {
  if (pathname.startsWith("/employer/candidates")) return "candidates";
  if (pathname.startsWith("/employer/qidiruv")) return "search";
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
  const tabs: EmployerTab[] = ["vacancies", "candidates", "search", "profile"];

  return (
    <div className={shell.tabBarSlot}>
      <nav className={cx(shell.employerTabBar, "hairline-top")}>
        {tabs.map((tab) => {
          const isActive = tab === active;
          const TabIcon = isActive ? ICONS[tab].solid : ICONS[tab].line;
          return (
            <button
              key={tab}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(ROUTES[tab])}
              className={cx("tap", shell.employerTab, isActive && shell.employerTabActive)}
            >
              <span className={shell.employerTabIcon}>
                <TabIcon size={26} />
                {tab === "candidates" && live > 0 && (
                  <CountBadge count={live} className={shell.employerTabBadge} />
                )}
              </span>
              <span className={shell.employerTabLabel}>{t.employer.tabs[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
