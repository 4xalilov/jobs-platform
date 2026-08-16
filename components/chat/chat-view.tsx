"use client";

import { Fragment, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageComposer } from "@/components/chat/message-composer";
import { VoiceBubble } from "@/components/chat/voice-bubble";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { IconArrowLeft, IconCheck, IconCheckDouble, IconClock } from "@/components/ui/icon";
import { NavBar } from "@/components/ui/nav-bar";
import { useChat, type ChatMessage } from "@/lib/use-chat";
import type { ChatDTO, ChatSide } from "@/lib/db/types";
import { cx } from "@/lib/utils";
import styles from "./chat.module.scss";

/** Kun ajratgichi: bugungi va kechagi kun nomlanadi, qolgani sana */
function useDayLabel() {
  const { t } = useI18n();

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
    // Brauzer o'zbek lokalini bilmasligi mumkin — qo'lda yig'amiz
    return `${date.getDate()} ${t.time.months[date.getMonth()]}`;
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
    <div className={styles.chat}>
      <NavBar
        className={cx(styles.navBar, "hairline")}
        leading={
          <button
            type="button"
            aria-label={t.common.back}
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <IconArrowLeft size={24} />
          </button>
        }
        title={
          <span className={styles.peer}>
            <Avatar name={chat.title} size={28} />
            <span className={styles.peerText}>
              <span className={styles.peerName}>{chat.title}</span>
              {status && <span className={styles.peerStatus}>{status}</span>}
            </span>
          </span>
        }
      />

      {context && (
        <div className={cx(styles.context, "hairline")}>
          <p className={styles.contextText}>{context}</p>
        </div>
      )}

      {/* Suhbat qisqa bo'lsa xabarlar pastda turadi — Telegramdagidek */}
      <div className={styles.thread}>
        {messages.map((message, index) => {
          const newDay = index === 0 || dayKey(message.at) !== dayKey(messages[index - 1].at);

          return (
            <Fragment key={message.id}>
              {newDay && <p className={styles.divider}>{dayLabel(message.at)}</p>}
              {message.from === "tizim" ? (
                <p className={styles.divider}>{systemText(message.text)}</p>
              ) : (
                <Bubble message={message} me={me} onRetry={() => retry(message.id)} />
              )}
            </Fragment>
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
    <div className={cx(styles.row, mine && styles.rowMine)}>
      <div
        className={cx(
          styles.bubble,
          mine && styles.bubbleMine,
          message.failed && styles.bubbleFailed,
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
          <p className={styles.text}>{message.text}</p>
        )}

        <span className={cx(styles.meta, mine && styles.metaMine)}>
          {message.failed ? (
            <button type="button" onClick={onRetry} className={styles.retry}>
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
