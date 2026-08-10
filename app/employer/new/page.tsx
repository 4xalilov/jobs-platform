import { NewVacancyFlow } from "@/components/employer/new-vacancy-flow";
import { listCities, listProfessions } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function NewVacancyPage() {
  await requireUser();
  const [professions, cities] = await Promise.all([listProfessions(), listCities()]);
  return <NewVacancyFlow professions={professions} cities={cities} />;
}
