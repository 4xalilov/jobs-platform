"use client";

import { useParams } from "next/navigation";
import { ChatView } from "@/components/chat/chat-view";
import { useI18n } from "@/components/providers/i18n-provider";
import { chatById, professionById } from "@/lib/mock-data";

export default function ChatPage() {
  const { t, locale } = useI18n();
  const params = useParams<{ id: string }>();
  const chat = chatById(params.id);

  if (!chat) return null;

  const profession = professionById(chat.professionId);

  return (
    <ChatView
      title={chat.company}
      status={chat.fastReply ? t.screens.chat.fastReplyStatus : undefined}
      context={profession ? profession.name[locale] : undefined}
      messages={chat.messages}
      me="candidate"
    />
  );
}
