"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconBolt,
  IconBookmark,
  IconCheck,
  IconClock,
  IconEye,
  IconMapPin,
  IconMessage,
  IconShieldCheck,
  IconUsers,
} from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { professionById, vacancyLocation, type Vacancy } from "@/lib/mock-data";
import { useApplied, useSaved } from "@/lib/stores";
import { formatSalary } from "@/lib/utils";

/**
 * Vakansiya sahifasi — pastdan ko'tariladigan sheet.
 * Yuqorida lavozim va maosh, keyin qisqa tavsif, pastda bitta katta tugma.
 */
export function VacancySheet({
  vacancy,
  open,
  onClose,
}: {
  vacancy: Vacancy | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { hasApplied, apply } = useApplied();
  const { isSaved, toggle } = useSaved();

  if (!vacancy) return null;

  const profession = professionById(vacancy.professionId);
  const applied = hasApplied(vacancy.id);
  const saved = isSaved(vacancy.id);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      closeLabel={t.common.close}
      footer={
        applied ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" className="flex-1" disabled>
              <IconCheck size={20} />
              {t.common.applied}
            </Button>
            <Button
              variant="primary"
              size="lg"
              leading={<IconMessage size={20} />}
              onClick={() => router.push("/messages")}
            >
              {t.tabs.messages}
            </Button>
          </div>
        ) : (
          <Button block size="lg" onClick={() => apply(vacancy.id)}>
            {t.common.apply}
          </Button>
        )
      }
    >
      <div className="px-4 pb-4">
        <div className="flex items-start gap-3">
          <Avatar name={vacancy.company} size={52} online={vacancy.fastReply} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] leading-6 font-semibold text-text">
              {profession ? profession.name[locale] : vacancy.company}
            </h2>
            <p className="mt-0.5 truncate text-body text-text-secondary">{vacancy.company}</p>
          </div>
          <button
            type="button"
            aria-label={t.common.save}
            aria-pressed={saved}
            onClick={() => toggle(vacancy.id)}
            className={saved ? "p-1 text-accent" : "p-1 text-text-tertiary"}
          >
            <IconBookmark size={24} />
          </button>
        </div>

        <p className="mt-3 text-[20px] leading-6 font-semibold text-text">
          {formatSalary(vacancy.salaryMin, vacancy.salaryMax, t.job.currency, t.job.negotiable)}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {vacancy.fastReply && (
            <Tag tone="success" icon={<IconBolt size={13} />}>
              {t.job.fastReply}
            </Tag>
          )}
          {vacancy.verified && (
            <Tag tone="accent" icon={<IconShieldCheck size={13} />}>
              {t.job.verified}
            </Tag>
          )}
          <Tag icon={<IconMapPin size={13} />}>{vacancyLocation(vacancy, locale)}</Tag>
          <Tag icon={<IconClock size={13} />}>{t.job.employment[vacancy.employment]}</Tag>
          <Tag>{t.job.experience[vacancy.experience]}</Tag>
        </div>

        <p className="mt-4 text-body text-text">{vacancy.description[locale]}</p>

        <div className="mt-4 flex gap-4 text-caption text-text-tertiary">
          <span className="flex items-center gap-1">
            <IconEye size={15} /> {vacancy.views} {t.job.views}
          </span>
          <span className="flex items-center gap-1">
            <IconUsers size={15} /> {vacancy.applications} {t.job.applications}
          </span>
        </div>
      </div>
    </Sheet>
  );
}
