import { EmployerProfileScreen } from "@/components/employer/employer-profile-screen";
import { getCompany, listEmployerVacancies } from "@/lib/db/queries";
import { currentCompanyId } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function EmployerProfilePage() {
  const companyId = await currentCompanyId();
  if (!companyId) return null;

  const [company, vacancies] = await Promise.all([
    getCompany(companyId),
    listEmployerVacancies(companyId),
  ]);
  if (!company) return null;

  return (
    <EmployerProfileScreen
      company={company}
      activeCount={vacancies.filter((v) => v.status === "faol").length}
      totalApplications={vacancies.reduce((sum, v) => sum + v.applications, 0)}
    />
  );
}
