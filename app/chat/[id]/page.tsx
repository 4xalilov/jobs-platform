"use client";

import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { IconArrowLeft, IconMic, IconSend } from "@/components/ui/icon";
import { NavBar } from "@/components/ui/nav-bar";
import { chatById, professionById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Ariza chat sifatida ochiladi — odamlar uchun eng tanish model */
export default function ChatPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const chat = chatById(params.id);

  if (!chat) {
    return (
      <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
        <NavBar
          title=""
          leading={
            <button type="button" onClick={() => router.back()} className="p-2 text-accent">
              <IconArrowLeft size={24} />
            </button>
          }
        />
      </div>
    );
  }

  const profession = professionById(chat.professionId);

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
            <Avatar name={chat.company} size={28} />
            <span className="min-w-0">
              <span className="block truncate text-title leading-tight">{chat.company}</span>
              {chat.fastReply && (
                <span className="block truncate text-[11px] leading-tight font-normal text-text-secondary">
                  {t.screens.chat.fastReplyStatus}
                </span>
              )}
            </span>
          </span>
        }
      />

      {/* Qaysi vakansiya haqida ekani — chat tepasida qoladi */}
      {profession && (
        <div className="bg-surface px-4 py-2 hairline">
          <p className="truncate text-caption text-text-secondary">{profession.name[locale]}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1.5 px-3 py-4">
        <p className="pb-1 text-center text-caption text-text-tertiary">
          {t.screens.chat.today}
        </p>

        {chat.messages.map((message) =>
          message.from === "system" ? (
            <p key={message.id} className="py-1 text-center text-caption text-text-tertiary">
              {message.text[locale]}
            </p>
          ) : (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.from === "candidate" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-tg px-3 py-2",
                  message.from === "candidate"
                    ? "bg-accent text-on-accent"
                    : "bg-surface text-text",
                )}
              >
                <p className="text-body break-words">{message.text[locale]}</p>
                <p
                  className={cn(
                    "mt-0.5 text-right text-[11px] leading-[13px]",
                    message.from === "candidate" ? "text-on-accent/70" : "text-text-tertiary",
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
          <button
            type="button"
            disabled
            aria-label={t.common.send}
            className="text-text-tertiary opacity-50"
          >
            <IconMic size={24} />
          </button>
          <button
            type="button"
            disabled
            aria-label={t.common.send}
            className="text-accent opacity-50"
          >
            <IconSend size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
