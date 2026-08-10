"use client";

import { ChatView } from "@/components/chat/chat-view";
import { useI18n } from "@/components/providers/i18n-provider";
import type { ChatDTO } from "@/lib/db/types";

/** Sarlavha ostidagi izoh va status tilga bog'liq — shuning uchun mijoz tomonida */
export function ChatScreen({ chat, me }: { chat: ChatDTO; me: "nomzod" | "ish_beruvchi" }) {
  const { t, locale } = useI18n();

  return (
    <ChatView
      chat={chat}
      me={me}
      context={chat.professionName?.[locale]}
      status={chat.fastReply ? t.screens.chat.fastReplyStatus : undefined}
    />
  );
}
