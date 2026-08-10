"use client";

import { useParams } from "next/navigation";
import { ChatView } from "@/components/chat/chat-view";
import { useI18n } from "@/components/providers/i18n-provider";
import { candidateById, professionById } from "@/lib/mock-data";

export default function EmployerChatPage() {
  const { locale } = useI18n();
  const params = useParams<{ id: string }>();
  const candidate = candidateById(params.id);

  if (!candidate) return null;

  const profession = professionById(candidate.professionId);

  return (
    <ChatView
      title={candidate.name}
      context={profession ? profession.name[locale] : undefined}
      messages={candidate.messages}
      me="employer"
    />
  );
}
