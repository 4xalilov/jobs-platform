"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { IconArrowLeft, IconMic, IconSend } from "@/components/ui/icon";
import { NavBar } from "@/components/ui/nav-bar";
import type { ChatMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Ariza chat sifatida ochiladi — ish qidiruvchi ham, ish beruvchi ham
 * shu ekranni ko'radi, faqat "men" tomoni almashadi.
 */
export function ChatView({
  title,
  status,
  context,
  messages,
  me,
}: {
  title: string;
  status?: string;
  context?: string;
  messages: ChatMessage[];
  me: "candidate" | "employer";
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-bg">
      <NavBar
        className="sticky top-0 z-20 hairline"
        leading={
          <button
            type="button"
            aria-label={t.common.back}
            onClick={() => router.back()}
            className="p-2 text-accent"
          >
            <IconArrowLeft size={24} />
          </button>
        }
        title={
          <span className="flex items-center justify-center gap-2">
            <Avatar name={title} size={28} />
            <span className="min-w-0">
              <span className="block truncate text-title leading-tight">{title}</span>
              {status && (
                <span className="block truncate text-[11px] leading-tight font-normal text-text-secondary">
                  {status}
                </span>
              )}
            </span>
          </span>
        }
      />

      {context && (
        <div className="bg-surface px-4 py-2 hairline">
          <p className="truncate text-caption text-text-secondary">{context}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1.5 px-3 py-4">
        <p className="pb-1 text-center text-caption text-text-tertiary">{t.screens.chat.today}</p>

        {messages.map((message) =>
          message.from === "system" ? (
            <p key={message.id} className="py-1 text-center text-caption text-text-tertiary">
              {message.text[locale]}
            </p>
          ) : (
            <div
              key={message.id}
              className={cn("flex", message.from === me ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-tg px-3 py-2",
                  message.from === me ? "bg-accent text-on-accent" : "bg-surface text-text",
                )}
              >
                <p className="text-body break-words">{message.text[locale]}</p>
                <p
                  className={cn(
                    "mt-0.5 text-right text-[11px] leading-[13px]",
                    message.from === me ? "text-on-accent/70" : "text-text-tertiary",
                  )}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Yozish paneli — 6-bosqichda ishga tushadi */}
      <div className="sticky bottom-0 border-t border-separator bg-surface px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center rounded-tg-sm bg-fill px-3">
            <span className="truncate text-body text-text-tertiary">
              {t.screens.chat.stagePlaceholder}
            </span>
          </div>
          <span className="text-text-tertiary opacity-50">
            <IconMic size={24} />
          </span>
          <span className="text-accent opacity-50">
            <IconSend size={24} />
          </span>
        </div>
      </div>
    </div>
  );
}
