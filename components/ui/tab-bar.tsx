"use client";

import { cn } from "@/lib/utils";
import { CountBadge } from "./badge";
import { IconBookmark, IconBriefcase, IconMessage, IconUser, type IconProps } from "./icon";

export type TabKey = "jobs" | "messages" | "saved" | "profile";

const ICONS: Record<TabKey, (p: IconProps) => React.ReactElement> = {
  jobs: IconBriefcase,
  messages: IconMessage,
  saved: IconBookmark,
  profile: IconUser,
};

/** Pastda tab bar — faqat 4 ta bo'lim */
export function TabBar({
  active,
  onChange,
  labels,
  badges,
  className,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  labels: Record<TabKey, string>;
  badges?: Partial<Record<TabKey, number>>;
  className?: string;
}) {
  const tabs: TabKey[] = ["jobs", "messages", "saved", "profile"];

  return (
    <nav
      className={cn(
        "flex border-t border-separator bg-surface/95 backdrop-blur-md",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {tabs.map((tab) => {
        const TabIcon = ICONS[tab];
        const isActive = tab === active;
        const count = badges?.[tab] ?? 0;

        return (
          <button
            key={tab}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-1.5",
              "transition-colors duration-100",
              isActive ? "text-accent" : "text-text-tertiary",
            )}
          >
            <span className="relative">
              <TabIcon size={26} />
              {count > 0 && (
                <CountBadge
                  count={count}
                  className="absolute -top-1 -right-2.5 border-2 border-surface"
                />
              )}
            </span>
            <span className="text-[10px] leading-[12px] font-medium">{labels[tab]}</span>
          </button>
        );
      })}
    </nav>
  );
}
