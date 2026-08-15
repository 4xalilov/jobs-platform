import { notFound } from "next/navigation";
import { ChannelView } from "@/components/channels/channel-view";
import { getChannel } from "@/lib/db/channels";
import { listVacancies } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const userId = await currentUserId();

  const [channel, page] = await Promise.all([
    getChannel(channelId, userId),
    listVacancies({ userId, channelId, limit: 12 }),
  ]);
  if (!channel) notFound();

  return <ChannelView channel={channel} initial={page} />;
}
