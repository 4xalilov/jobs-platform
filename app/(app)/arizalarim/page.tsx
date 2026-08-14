import { ApplicationList } from "@/components/applications/application-list";
import { listApplications } from "@/lib/db/queries";
import { requireUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

/** Arizalarim — foydalanuvchini ilovaga qaytaradigan ekran */
export default async function ApplicationsPage() {
  const user = await requireUser();
  return <ApplicationList applications={await listApplications(user.id)} />;
}
