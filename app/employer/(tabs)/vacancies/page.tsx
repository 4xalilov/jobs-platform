import { EmployerVacancyList } from "@/components/employer/employer-vacancy-list";
import { listEmployerVacancies } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function EmployerVacanciesPage() {
  const companyId = await currentCompanyId();
  const vacancies = companyId ? await listEmployerVacancies(companyId) : [];
  return <EmployerVacancyList initial={vacancies} />;
}
