import { ProfileScreen } from "@/components/profile/profile-screen";
import {
  getCard,
  listChats,
  listCities,
  listProfessions,
  listSavedVacancies,
} from "@/lib/db/queries";
import { currentUserId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await currentUserId();
  if (!userId) return null;

  const [card, professions, cities, saved, chats] = await Promise.all([
    getCard(userId),
    listProfessions(),
    listCities(),
    listSavedVacancies(userId),
    listChats(userId),
  ]);

  return (
    <ProfileScreen
      card={card}
      professions={professions}
      cities={cities}
      savedCount={saved.length}
      applicationCount={chats.length}
    />
  );
}
