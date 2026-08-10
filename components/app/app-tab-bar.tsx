"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { TabBar, type TabKey } from "@/components/ui/tab-bar";

const ROUTES: Record<TabKey, string> = {
  jobs: "/jobs",
  messages: "/messages",
  saved: "/saved",
  profile: "/profile",
};

function activeTab(pathname: string): TabKey {
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/saved")) return "saved";
  if (pathname.startsWith("/profile")) return "profile";
  return "jobs";
}

export function AppTabBar({ unread = 0 }: { unread?: number }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2">
      <TabBar
        active={activeTab(pathname)}
        onChange={(tab) => router.push(ROUTES[tab])}
        labels={{
          jobs: t.tabs.jobs,
          messages: t.tabs.messages,
          saved: t.tabs.saved,
          profile: t.tabs.profile,
        }}
        badges={{ messages: unread }}
      />
    </div>
  );
}
