import { ChatList } from "@/components/chat/chat-list";
import { listChats } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Ariza ro'yxati emas — xabarlar ro'yxati, xuddi Telegram'dagidek */
export default async function MessagesPage() {
  const userId = await currentUserId();
  const chats = userId ? await listChats(userId) : [];
  return <ChatList chats={chats} />;
}
