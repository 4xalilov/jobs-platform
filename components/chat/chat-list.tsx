"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconMessage } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { apiGet } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import type { ChatListItemDTO, ChatSide } from "@/lib/db/types";

/**
 * Tizim xabarlari va ovozli xabar bazada kalit sifatida saqlanadi,
 * matni tarjimadan olinadi — shunda til almashsa ro'yxat ham o'zgaradi.
 */
export function useSystemMessageText(side: ChatSide = "nomzod") {
  const { t } = useI18n();
  return (raw: string) => {
    if (raw === "ariza_yuborildi") {
      return side === "nomzod" ? t.screens.chat.applicationSent : t.screens.chat.applicationReceived;
    }
    if (raw === "ovozli_xabar") return t.screens.chat.voiceMessage;
    return raw;
  };
}

export function ChatList({ chats: initial }: { chats: ChatListItemDTO[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const systemText = useSystemMessageText("nomzod");
  const [chats, setChats] = useState(initial);

  // Ro'yxat ochiq turganda yangi xabarlar o'zi paydo bo'ladi
  const refresh = useCallback(async () => {
    setChats(await apiGet<ChatListItemDTO[]>("/chats"));
  }, []);
  usePolling(refresh, 5000);

  return (
    <>
      <NavBar title={t.tabs.messages} className="sticky top-0 z-20 hairline" />

      {chats.length === 0 ? (
        <EmptyState
          icon={<IconMessage size={44} />}
          title={t.screens.messages.empty}
          hint={t.screens.messages.emptyHint}
        />
      ) : (
        <ListGroup>
          {chats.map((chat, i) => (
            <ListItem
              key={chat.id}
              leading={<Avatar name={chat.company} online={chat.fastReply} />}
              title={chat.company}
              subtitle={systemText(chat.lastMessage)}
              meta={chat.lastMessageAt}
              trailing={<CountBadge count={chat.unread} />}
              last={i === chats.length - 1}
              onClick={() => router.push(`/chat/${chat.id}`)}
            />
          ))}
        </ListGroup>
      )}
    </>
  );
}
