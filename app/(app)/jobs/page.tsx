import { ChannelList } from "@/components/channels/channel-list";
import { listSubscribedChannels } from "@/lib/db/channels";
import { requireUser } from "@/lib/db/session";

// Ro'yxat har safar bazadan olinadi
export const dynamic = "force-dynamic";

/** v4: "Ishlar" tabi endi vakansiyalar emas, kanallar ro'yxati */
export default async function JobsPage() {
  const user = await requireUser();
  return <ChannelList initial={await listSubscribedChannels(user.id)} />;
}
