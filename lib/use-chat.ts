"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import type { ChatSide, ChatUpdateDTO, MessageDTO } from "@/lib/db/types";

/** Yuborilayotgan va yuborilmagan xabarlar ham shu ro'yxatda turadi */
export type ChatMessage = MessageDTO & { pending?: boolean; failed?: boolean };

type Draft = { text?: string; blob?: Blob; durationMs?: number };

const INTERVAL_MS = 2500;

function byTime(a: ChatMessage, b: ChatMessage): number {
  return a.at === b.at ? a.id.localeCompare(b.id) : a.at < b.at ? -1 : 1;
}

/** Kursor sifatida faqat bazaga tushgan xabar vaqti ishlatiladi */
function lastServerAt(messages: ChatMessage[]): string | null {
  let last: string | null = null;
  for (const message of messages) {
    if (!message.pending && !message.failed && (last === null || message.at > last)) {
      last = message.at;
    }
  }
  return last;
}

async function uploadAudio(blob: Blob, durationMs: number): Promise<string> {
  const response = await fetch(`/api/audio?ms=${Math.round(durationMs)}`, {
    method: "POST",
    headers: { "content-type": blob.type || "audio/webm" },
    body: blob,
  });
  if (!response.ok) throw new Error(`Ovoz yuklanmadi: ${response.status}`);
  return ((await response.json()) as { id: string }).id;
}

export function useChat(chatId: string, initial: MessageDTO[], me: ChatSide) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const cursor = useRef<string | null>(lastServerAt(initial));
  const drafts = useRef(new Map<string, Draft>());
  const seq = useRef(0);
  const readPending = useRef(false);

  const markRead = useCallback(() => {
    if (readPending.current) return;
    readPending.current = true;
    void apiPost(`/chats/${chatId}/read`)
      .catch(() => undefined)
      .finally(() => {
        readPending.current = false;
      });
  }, [chatId]);

  const merge = useCallback(
    (update: ChatUpdateDTO) => {
      if (update.messages.length === 0 && !update.readUpTo) return;

      for (const message of update.messages) {
        if (cursor.current === null || message.at > cursor.current) cursor.current = message.at;
      }
      // Qarshi tomondan yangi xabar keldi — ekran ochiq, demak o'qildi
      if (update.messages.some((message) => message.from !== me && message.from !== "tizim")) {
        markRead();
      }

      setMessages((previous) => {
        const merged = new Map(previous.map((message) => [message.id, message]));
        for (const message of update.messages) merged.set(message.id, message);

        const list = [...merged.values()];
        const readUpTo = update.readUpTo;
        return (
          readUpTo
            ? list.map((message) =>
                message.from === me && !message.read && !message.pending && message.at <= readUpTo
                  ? { ...message, read: true }
                  : message,
              )
            : list
        ).sort(byTime);
      });
    },
    [markRead, me],
  );

  const poll = useCallback(async () => {
    const since = cursor.current;
    const update = await apiGet<ChatUpdateDTO>(
      `/chats/${chatId}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`,
    );
    merge(update);
  }, [chatId, merge]);

  usePolling(poll, INTERVAL_MS);

  // Ekran ochildi — server tomonda o'qilmagan qolganlari bor
  useEffect(() => {
    markRead();
  }, [markRead]);

  const deliver = useCallback(
    async (localId: string, draft: Draft) => {
      try {
        const audioId = draft.blob
          ? await uploadAudio(draft.blob, draft.durationMs ?? 0)
          : undefined;
        const saved = await apiPost<MessageDTO>(`/chats/${chatId}/messages`, {
          text: draft.text,
          audioId,
          durationMs: draft.durationMs,
        });

        drafts.current.delete(localId);
        if (cursor.current === null || saved.at > cursor.current) cursor.current = saved.at;
        setMessages((previous) =>
          previous.map((message) => (message.id === localId ? saved : message)).sort(byTime),
        );
      } catch {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === localId ? { ...message, pending: false, failed: true } : message,
          ),
        );
      }
    },
    [chatId],
  );

  /** Optimistik: xabar darhol ko'rinadi, keyin serverdagisi bilan almashadi */
  const send = useCallback(
    (draft: Draft) => {
      if (!draft.text?.trim() && !draft.blob) return;

      seq.current += 1;
      const localId = `mahalliy-${seq.current}`;
      drafts.current.set(localId, draft);

      const now = new Date();
      const optimistic: ChatMessage = {
        id: localId,
        from: me,
        text: draft.text?.trim() ?? "",
        time: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        at: now.toISOString(),
        read: false,
        pending: true,
        ...(draft.blob ? { audioUrl: URL.createObjectURL(draft.blob) } : {}),
        ...(draft.durationMs ? { durationMs: draft.durationMs } : {}),
      };

      setMessages((previous) => [...previous, optimistic].sort(byTime));
      void deliver(localId, draft);
    },
    [deliver, me],
  );

  const retry = useCallback(
    (localId: string) => {
      const draft = drafts.current.get(localId);
      if (!draft) return;
      setMessages((previous) =>
        previous.map((message) =>
          message.id === localId ? { ...message, pending: true, failed: false } : message,
        ),
      );
      void deliver(localId, draft);
    },
    [deliver],
  );

  return useMemo(() => ({ messages, send, retry, markRead }), [messages, send, retry, markRead]);
}
