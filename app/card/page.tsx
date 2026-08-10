import { notFound } from "next/navigation";
import { CardEditor } from "@/components/profile/card-editor";
import { getCard, listCities, listProfessions } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function CardPage() {
  const user = await requireUser();
  const userId = user.id;

  const [card, professions, cities] = await Promise.all([
    getCard(userId),
    listProfessions(),
    listCities(),
  ]);
  if (!card) notFound();

  return <CardEditor card={card} professions={professions} cities={cities} />;
}
