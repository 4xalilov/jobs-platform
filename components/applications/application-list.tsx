"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconDocument } from "@/components/ui/icon";
import { LargeTitle } from "@/components/ui/large-title";
import { ListGroup, ListItem } from "@/components/ui/list";
import type { ApplicationDTO, ApplicationStatus } from "@/lib/db/types";
import { cn } from "@/lib/utils";

/** Holat rangi: javob kelgani yashil, kutayotgani kulrang */
const STATUS_TONE: Record<ApplicationStatus, string> = {
  yuborildi: "text-text-secondary",
  korildi: "text-text-secondary",
  korib_chiqilmoqda: "text-warning",
  javob_berildi: "text-success",
};

/**
 * Arizalarim — v2 da "Saqlangan" o'rniga kelgan bo'lim.
 * Sababi: ariza yuborgan odam ilovaga qaytishi uchun sabab kerak, holat
 * o'zgarishi esa shu sabab. To'liq zanjir (4 bosqich vaqti bilan) va
 * o'xshash vakansiya taklifi 6-bosqichda — ishonch qatlamida qo'shiladi.
 */
export function ApplicationList({ applications }: { applications: ApplicationDTO[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  if (applications.length === 0) {
    return (
      <>
        <LargeTitle>{t.screens.applications.title}</LargeTitle>
        <EmptyState
          icon={<IconDocument size={44} />}
          title={t.screens.applications.empty}
          hint={t.screens.applications.emptyHint}
        />
      </>
    );
  }

  return (
    <>
      <LargeTitle>{t.screens.applications.title}</LargeTitle>

      <ListGroup>
        {applications.map((application, i) => (
          <ListItem
            key={application.id}
            className="animate-row-in"
            leading={<Avatar name={application.company} />}
            title={application.vacancyTitle}
            subtitle={`${application.company}${
              application.cityName ? ` · ${application.cityName[locale]}` : ""
            }`}
            caption={
              <span className={cn(STATUS_TONE[application.status])}>
                {t.screens.applications.status[application.status]}
              </span>
            }
            meta={application.sentLabel}
            trailing={
              application.stale ? <Tag>{t.screens.applications.stale}</Tag> : undefined
            }
            last={i === applications.length - 1}
            onClick={() => {
              if (application.chatId) router.push(`/chat/${application.chatId}`);
            }}
          />
        ))}
      </ListGroup>
    </>
  );
}
