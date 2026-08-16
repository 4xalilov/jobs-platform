"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { TabBar } from "@/components/ui/tab-bar";
import { tabOf, type TabKey, useTabNavigation } from "@/lib/navigation";
import { useUnread } from "@/lib/use-unread";

/** v4: Ishlar tabi kanallar ro'yxati; Saqlangan Profil ichida. */
const TABS: TabKey[] = ["jobs", "applications", "messages", "profile"];

export function AppTabBar({ unread = 0 }: { unread?: number }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const goToTab = useTabNavigation();
  const live = useUnread(unread);

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[27.5rem] -translate-x-1/2">
      <TabBar
        active={tabOf(pathname)}
        tabs={TABS}
        onChange={goToTab}
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
