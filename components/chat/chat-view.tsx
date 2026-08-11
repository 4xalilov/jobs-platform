"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageComposer } from "@/components/chat/message-composer";
import { VoiceBubble } from "@/components/chat/voice-bubble";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { IconArrowLeft, IconCheck, IconCheckDouble, IconClock } from "@/components/ui/icon";
import { NavBar } from "@/components/ui/nav-bar";
import { useChat, type ChatMessage } from "@/lib/use-chat";
import type { ChatDTO, ChatSide } from "@/lib/db/types";
import { cn } from "@/lib/utils";

/** Kun ajratgichi: bugungi va kechagi kun nomlanadi, qolgani sana */
function useDayLabel() {
  const { t, locale } = useI18n();
  const tag = locale === "ru" ? "ru-RU" : "uz-UZ";

  return (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const days = Math.round(
      (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
        86_400_000,
    );
    if (days <= 0) return t.screens.chat.today;
    if (days === 1) return t.screens.chat.yesterday;
    return date.toLocaleDateString(tag, { day: "numeric", month: "long" });
  };
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Ariza chat sifatida ochiladi — ish qidiruvchi ham, ish beruvchi ham
 * shu ekranni ko'radi, faqat "men" tomoni almashadi.
 */
export function ChatView({
  chat,
  context,
  status,
  me,
}: {
  chat: ChatDTO;
  context?: string;
  status?: string;
  me: ChatSide;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const dayLabel = useDayLabel();
  const { messages, send, retry } = useChat(chat.id, chat.messages, me);

  const bottom = useRef<HTMLDivElement>(null);
  const count = messages.length;

  // Yangi xabar kelganda pastga tushamiz — Telegramdagidek
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [count]);

  const systemText = (raw: string) =>
    raw === "ariza_yuborildi"
      ? me === "nomzod"
        ? t.screens.chat.applicationSent
        : t.screens.chat.applicationReceived
      : raw;

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
            <Avatar name={chat.title} size={28} />
            <span className="min-w-0">
              <span className="block truncate text-title leading-tight">{chat.title}</span>
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

      {/* Suhbat qisqa bo'lsa xabarlar pastda turadi — Telegramdagidek */}
      <div className="flex flex-1 flex-col justify-end gap-1.5 px-3 py-4">
        {messages.map((message, index) => {
          const newDay = index === 0 || dayKey(message.at) !== dayKey(messages[index - 1].at);

          return (
            <div key={message.id} className="contents">
              {newDay && (
                <p className="py-1 text-center text-caption text-text-tertiary">
                  {dayLabel(message.at)}
                </p>
              )}
              {message.from === "tizim" ? (
                <p className="py-1 text-center text-caption text-text-tertiary">
                  {systemText(message.text)}
                </p>
              ) : (
                <Bubble message={message} me={me} onRetry={() => retry(message.id)} />
              )}
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <MessageComposer onSend={send} />
    </div>
  );
}

function Bubble({
  message,
  me,
  onRetry,
}: {
  message: ChatMessage;
  me: ChatSide;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  const mine = message.from === me;

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-tg px-3 py-2",
          mine ? "bg-accent text-on-accent" : "bg-surface text-text",
          message.failed && "opacity-60",
        )}
      >
        {message.audioUrl ? (
          <VoiceBubble
            url={message.audioUrl}
            durationMs={message.durationMs}
            mine={mine}
            label={t.screens.chat.voiceMessage}
          />
        ) : (
          <p className="text-body break-words whitespace-pre-wrap">{message.text}</p>
        )}

        <span
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1 text-[11px] leading-[13px]",
            mine ? "text-on-accent/70" : "text-text-tertiary",
          )}
        >
          {message.failed ? (
            <button type="button" onClick={onRetry} className="underline">
              {t.screens.chat.notSent} · {t.common.retry}
            </button>
          ) : (
            <>
              {message.time}
              {mine &&
                (message.pending ? (
                  <IconClock size={13} />
                ) : message.read ? (
                  <IconCheckDouble size={14} />
                ) : (
                  <IconCheck size={13} />
                ))}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
