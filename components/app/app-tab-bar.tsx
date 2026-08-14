"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { TabBar, type TabKey } from "@/components/ui/tab-bar";
import { useUnread } from "@/lib/use-unread";

/** v2: Saqlangan o'rniga Arizalarim. Saqlanganlar Ishlar ichida filtr. */
const TABS: TabKey[] = ["jobs", "applications", "messages", "profile"];

const ROUTES: Partial<Record<TabKey, string>> = {
  jobs: "/jobs",
  applications: "/arizalarim",
  messages: "/messages",
  profile: "/profile",
};

function activeTab(pathname: string): TabKey {
  if (pathname.startsWith("/arizalarim")) return "applications";
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/profile")) return "profile";
  return "jobs";
}

export function AppTabBar({ unread = 0 }: { unread?: number }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const live = useUnread(unread);

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2">
      <TabBar
        active={activeTab(pathname)}
        tabs={TABS}
        onChange={(tab) => {
          const route = ROUTES[tab];
          if (route) router.push(route);
        }}
        labels={{
          jobs: t.tabs.jobs,
          applications: t.tabs.applications,
          messages: t.tabs.messages,
          profile: t.tabs.profile,
        }}
        badges={{ messages: live }}
      />
    </div>
  );
}
