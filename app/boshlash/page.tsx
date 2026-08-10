import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { listCities, listProfessions } from "@/lib/db/queries";
import { currentUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/kirish");

  // Allaqachon to'ldirgan bo'lsa — ilovaga
  if (user.role === "nomzod" && user.hasCard) redirect("/jobs");
  if (user.role === "ish_beruvchi" && user.companyId) redirect("/employer/vacancies");

  const [professions, cities] = await Promise.all([listProfessions(), listCities()]);
  return <OnboardingFlow name={user.name} professions={professions} cities={cities} />;
}
