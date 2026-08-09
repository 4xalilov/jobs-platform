"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Dot } from "@/components/ui/badge";
import { IconBookmark, IconShieldCheck } from "@/components/ui/icon";
import { ListItem } from "@/components/ui/list";
import { professionById, vacancyLocation, type Vacancy } from "@/lib/mock-data";
import { formatAgo, formatSalary } from "@/lib/utils";

/**
 * Vakansiya qatori: kompaniya logosi, lavozim, maosh + shahar izoh sifatida,
 * o'ngda joylashtirilgan vaqti.
 */
export function VacancyRow({
  vacancy,
  last = false,
  saved = false,
  showDistance = false,
  onOpen,
}: {
  vacancy: Vacancy;
  last?: boolean;
  saved?: boolean;
  showDistance?: boolean;
  onOpen: (vacancy: Vacancy) => void;
}) {
  const { t, locale } = useI18n();
  const profession = professionById(vacancy.professionId);

  const location = vacancyLocation(vacancy, locale);
  const caption = showDistance
    ? `${vacancy.company} · ${vacancy.distanceKm} ${t.job.km}`
    : `${vacancy.company} · ${location}`;

  return (
    <ListItem
      leading={<Avatar name={vacancy.company} online={vacancy.fastReply} />}
      title={profession ? profession.name[locale] : vacancy.company}
      titleAdornment={
        <span className="flex items-center gap-1">
          {vacancy.verified && <IconShieldCheck size={15} className="text-accent" />}
          {saved && <IconBookmark size={14} className="text-accent" />}
        </span>
      }
      subtitle={formatSalary(
        vacancy.salaryMin,
        vacancy.salaryMax,
        t.job.currency,
        t.job.negotiable,
      )}
      caption={caption}
      meta={formatAgo(vacancy.postedMinutesAgo, t.time)}
      trailing={vacancy.fastReply ? <Dot className="bg-success" /> : undefined}
      last={last}
      onClick={() => onOpen(vacancy)}
    />
  );
}
