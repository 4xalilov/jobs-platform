import { NewVacancyFlow } from "@/components/employer/new-vacancy-flow";
import { listCities, listProfessions } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function NewVacancyPage() {
  const [professions, cities] = await Promise.all([listProfessions(), listCities()]);
  return <NewVacancyFlow professions={professions} cities={cities} />;
}
