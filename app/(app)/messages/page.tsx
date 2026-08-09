"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconMessage } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { chats } from "@/lib/mock-data";

/** Ariza ro'yxati emas — xabarlar ro'yxati, xuddi Telegram'dagidek */
export default function MessagesPage() {
  const { t, locale } = useI18n();
  const router = useRouter();

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
          {chats.map((chat, i) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            return (
              <ListItem
                key={chat.id}
                leading={<Avatar name={chat.company} online={chat.fastReply} />}
                title={chat.company}
                subtitle={lastMessage.text[locale]}
                meta={chat.time}
                trailing={<CountBadge count={chat.unread} />}
                last={i === chats.length - 1}
                onClick={() => router.push(`/chat/${chat.id}`)}
              />
            );
          })}
        </ListGroup>
      )}
    </>
  );
}
