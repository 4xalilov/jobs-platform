"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconMessage } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import type { ChatListItemDTO } from "@/lib/db/types";

/** Tizim xabarlari bazada kalit sifatida saqlanadi, matni tarjimadan olinadi */
export function useSystemMessageText() {
  const { t } = useI18n();
  return (raw: string) => (raw === "ariza_yuborildi" ? t.screens.chat.applicationSent : raw);
}

export function ChatList({ chats }: { chats: ChatListItemDTO[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const systemText = useSystemMessageText();

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
