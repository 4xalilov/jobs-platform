"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button, Fab } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBolt, IconBriefcase, IconEye, IconPlus, IconTrash, IconUsers } from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Sheet } from "@/components/ui/sheet";
import { apiDelete } from "@/lib/api";
import type { EmployerVacancyDTO } from "@/lib/db/types";
import { useSheet } from "@/lib/use-sheet";
import { formatAgo, formatSalary } from "@/lib/utils";

/** Mening vakansiyalarim — har birida ko'rishlar va arizalar soni */
export function EmployerVacancyList({ initial }: { initial: EmployerVacancyDTO[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const detail = useSheet<EmployerVacancyDTO>();

  const active = items.filter((item) => item.status === "faol");
  const expired = items.filter((item) => item.status !== "faol");

  const location = (vacancy: EmployerVacancyDTO) => {
    const city = vacancy.cityName?.[locale] ?? "";
    const district = vacancy.districtName?.[locale];
    return district ? `${city}, ${district}` : city;
  };

  const remove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    detail.close();
    void apiDelete(`/employer/vacancies/${id}`).then(() => router.refresh());
  };

  const renderRow = (vacancy: EmployerVacancyDTO, last: boolean) => (
    <ListItem
      key={vacancy.id}
      leading={<Avatar name={vacancy.professionName?.[locale] ?? vacancy.title} />}
      title={vacancy.professionName?.[locale] ?? vacancy.title}
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

  return (
    <>
      <NavBar title={t.employer.vacancies.title} className="sticky top-0 z-20 hairline" />

      {items.length === 0 ? (
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
            <Button
              variant="danger"
              size="lg"
              aria-label={t.employer.vacancies.closeVacancy}
              onClick={() => detail.value && remove(detail.value.id)}
            >
              <IconTrash size={20} />
            </Button>
          </div>
        }
      >
        {detail.value && (
          <div className="px-4 pb-4">
            <h2 className="text-[20px] leading-6 font-semibold text-text">
              {detail.value.professionName?.[locale] ?? detail.value.title}
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
              <Tag tone={detail.value.status === "faol" ? "success" : "neutral"}>
                {detail.value.status === "faol"
                  ? `${detail.value.daysLeft} ${t.employer.vacancies.daysLeft}`
                  : t.employer.vacancies.expired}
              </Tag>
              <Tag tone={detail.value.plan === "free" ? "neutral" : "warning"}>
                {t.employer.plans[detail.value.plan]}
              </Tag>
            </div>

            {detail.value.description && (
              <p className="mt-4 text-body text-text">{detail.value.description}</p>
            )}

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
