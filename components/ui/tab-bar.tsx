"use client";

import { cn } from "@/lib/utils";
import { CountBadge } from "./badge";
import {
  IconBookmark,
  IconBookmarkSolid,
  IconBriefcase,
  IconBriefcaseSolid,
  IconDocument,
  IconDocumentSolid,
  IconMessage,
  IconMessageSolid,
  IconUser,
  IconUserSolid,
  type IconProps,
} from "./icon";

export type TabKey = "jobs" | "applications" | "messages" | "saved" | "profile";

type IconPair = {
  line: (p: IconProps) => React.ReactElement;
  solid: (p: IconProps) => React.ReactElement;
};

/** Faol tab chiziqlidan to'ldirilgan variantga o'tadi */
const ICONS: Record<TabKey, IconPair> = {
  jobs: { line: IconBriefcase, solid: IconBriefcaseSolid },
  applications: { line: IconDocument, solid: IconDocumentSolid },
  messages: { line: IconMessage, solid: IconMessageSolid },
  saved: { line: IconBookmark, solid: IconBookmarkSolid },
  profile: { line: IconUser, solid: IconUserSolid },
};

/** v2 tuzilmasi: Ishlar / Arizalarim / Xabarlar / Profil */
export const DEFAULT_TABS: TabKey[] = ["jobs", "applications", "messages", "profile"];

/** Pastda tab bar — faqat 4 ta bo'lim, balandligi 50px + safe area */
export function TabBar({
  active,
  tabs = DEFAULT_TABS,
  onChange,
  labels,
  badges,
  className,
}: {
  active: TabKey;
  /** Qaysi bo'limlar chiqishi — ekranlar tayyor bo'lishiga qarab */
  tabs?: TabKey[];
  onChange: (tab: TabKey) => void;
  labels: Partial<Record<TabKey, string>>;
  badges?: Partial<Record<TabKey, number>>;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "hairline-top relative flex bg-surface/95 backdrop-blur-md",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab === active;
        const TabIcon = isActive ? ICONS[tab].solid : ICONS[tab].line;
        const count = badges?.[tab] ?? 0;

        return (
          <button
            key={tab}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab)}
            className={cn(
              "tap relative flex h-[50px] flex-1 flex-col items-center justify-center gap-0.5",
              isActive ? "text-accent" : "text-text-secondary",
            )}
          >
            <span className="relative">
              <TabIcon size={26} />
              {count > 0 && (
                <CountBadge
                  count={count}
                  className="badge-pop absolute -top-1 -right-2.5 border-2 border-surface"
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
