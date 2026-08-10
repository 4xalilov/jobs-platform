"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button, Fab } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  IconBolt,
  IconBriefcase,
  IconEye,
  IconPlus,
  IconTrash,
  IconUsers,
} from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Sheet } from "@/components/ui/sheet";
import {
  cityById,
  company,
  professionById,
  resolveText,
  type EmployerVacancy,
} from "@/lib/mock-data";
import { useMyVacancies } from "@/lib/stores";
import { useSheet } from "@/lib/use-sheet";
import { formatAgo, formatSalary } from "@/lib/utils";

/** Mening vakansiyalarim — har birida ko'rishlar va arizalar soni */
export default function EmployerVacanciesPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { vacancies, created, remove } = useMyVacancies();
  const detail = useSheet<EmployerVacancy>();

  const active = vacancies.filter((v) => v.status === "active");
  const expired = vacancies.filter((v) => v.status === "expired");

  const location = (vacancy: EmployerVacancy) => {
    const city = cityById(vacancy.cityId);
    if (!city) return "";
    const district =
      vacancy.districtIndex !== null ? city.districts[vacancy.districtIndex] : undefined;
    return district ? `${city.name[locale]}, ${district[locale]}` : city.name[locale];
  };

  const renderRow = (vacancy: EmployerVacancy, last: boolean) => {
    const profession = professionById(vacancy.professionId);
    return (
      <ListItem
        key={vacancy.id}
        leading={<Avatar name={profession ? profession.name[locale] : company.name} />}
        title={profession ? profession.name[locale] : company.name}
        titleAdornment={
          vacancy.plan !== "free" ? <IconBolt size={14} className="text-warning" /> : undefined
        }
        subtitle={formatSalary(
          vacancy.salaryMin,
          vacancy.salaryMax,
          t.job.currency,
          t.job.negotiable,
        )}
        caption={`${vacancy.views} ${t.employer.vacancies.views} · ${vacancy.applications} ${t.employer.vacancies.applications}`}
        meta={formatAgo(vacancy.postedMinutesAgo, t.time)}
        trailing={
          vacancy.newApplications > 0 ? (
            <span className="rounded-full bg-accent px-1.5 text-caption font-medium text-on-accent">
              +{vacancy.newApplications}
            </span>
          ) : undefined
        }
        last={last}
        onClick={() => detail.open(vacancy)}
      />
    );
  };

  return (
    <>
      <NavBar title={t.employer.vacancies.title} className="sticky top-0 z-20 hairline" />

      {vacancies.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={44} />}
          title={t.employer.vacancies.empty}
          hint={t.employer.vacancies.emptyHint}
          action={
            <Button onClick={() => router.push("/employer/new")}>
              {t.employer.vacancies.add}
            </Button>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <>
              <SectionHeader>{t.employer.vacancies.active}</SectionHeader>
              <ListGroup>
                {active.map((vacancy, i) => renderRow(vacancy, i === active.length - 1))}
              </ListGroup>
            </>
          )}

          {expired.length > 0 && (
            <>
              <SectionHeader>{t.employer.vacancies.expired}</SectionHeader>
              <ListGroup>
                {expired.map((vacancy, i) => renderRow(vacancy, i === expired.length - 1))}
              </ListGroup>
            </>
          )}
        </>
      )}

      {/* Asosiy harakat — vakansiya joylash */}
      <div className="fixed bottom-[calc(70px+env(safe-area-inset-bottom))] left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2">
        <div className="flex justify-end pr-4">
          <Fab label={t.employer.vacancies.add} onClick={() => router.push("/employer/new")}>
            <IconPlus size={28} />
          </Fab>
        </div>
      </div>

      <Sheet
        open={detail.isOpen}
        onClose={detail.close}
        closeLabel={t.common.close}
        footer={
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              leading={<IconBolt size={20} />}
              onClick={() => router.push("/employer/plans")}
            >
              {t.employer.vacancies.boost}
            </Button>
            {detail.value && created.some((v) => v.id === detail.value?.id) && (
              <Button
                variant="danger"
                size="lg"
                aria-label={t.employer.vacancies.closeVacancy}
                onClick={() => {
                  if (detail.value) remove(detail.value.id);
                  detail.close();
                }}
              >
                <IconTrash size={20} />
              </Button>
            )}
          </div>
        }
      >
        {detail.value && (
          <div className="px-4 pb-4">
            <h2 className="text-[20px] leading-6 font-semibold text-text">
              {professionById(detail.value.professionId)?.name[locale] ?? company.name}
            </h2>
            <p className="mt-3 text-[20px] leading-6 font-semibold text-text">
              {formatSalary(
                detail.value.salaryMin,
                detail.value.salaryMax,
                t.job.currency,
                t.job.negotiable,
              )}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>{location(detail.value)}</Tag>
              <Tag>{t.job.employment[detail.value.employment]}</Tag>
              <Tag tone={detail.value.status === "active" ? "success" : "neutral"}>
                {detail.value.status === "active"
                  ? `${detail.value.daysLeft} ${t.employer.vacancies.daysLeft}`
                  : t.employer.vacancies.expired}
              </Tag>
              <Tag tone={detail.value.plan === "free" ? "neutral" : "warning"}>
                {t.employer.plans[detail.value.plan]}
              </Tag>
            </div>

            <p className="mt-4 text-body text-text">{resolveText(detail.value.description, locale)}</p>

            <div className="mt-4 flex gap-4 text-caption text-text-tertiary">
              <span className="flex items-center gap-1">
                <IconEye size={15} /> {detail.value.views} {t.employer.vacancies.views}
              </span>
              <span className="flex items-center gap-1">
                <IconUsers size={15} /> {detail.value.applications}{" "}
                {t.employer.vacancies.applications}
              </span>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
