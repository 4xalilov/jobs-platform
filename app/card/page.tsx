import { notFound } from "next/navigation";
import { CardEditor } from "@/components/profile/card-editor";
import { getCard, listCities, listProfessions } from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function CardPage() {
  const userId = await currentUserId();
  if (!userId) notFound();

  const [card, professions, cities] = await Promise.all([
    getCard(userId),
    listProfessions(),
    listCities(),
  ]);
  if (!card) notFound();

  return <CardEditor card={card} professions={professions} cities={cities} />;
}
