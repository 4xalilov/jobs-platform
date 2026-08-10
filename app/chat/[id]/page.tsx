import { notFound } from "next/navigation";
import { ChatScreen } from "@/components/chat/chat-screen";
import { getChat } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  const chat = userId ? await getChat(id, userId) : null;
  if (!chat) notFound();

  return <ChatScreen chat={chat} me="nomzod" />;
}
