import { ChannelCatalog } from "@/components/channels/channel-catalog";
import { listChannelCatalog } from "@/lib/db/channels";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Katalog — obunasiz ham ochiladi */
export default async function CatalogPage() {
  const userId = await currentUserId();
  return <ChannelCatalog initial={await listChannelCatalog(userId)} />;
}
