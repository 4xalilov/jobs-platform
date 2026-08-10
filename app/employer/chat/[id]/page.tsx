import { notFound } from "next/navigation";
import { ChatScreen } from "@/components/chat/chat-screen";
import { getEmployerChat } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function EmployerChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await currentCompanyId();
  const chat = companyId ? await getEmployerChat(id, companyId) : null;
  if (!chat) notFound();

  return <ChatScreen chat={chat} me="ish_beruvchi" />;
}
