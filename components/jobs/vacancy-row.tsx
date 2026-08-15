"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Dot } from "@/components/ui/badge";
import { IconBookmark, IconShieldCheck } from "@/components/ui/icon";
import { ListItem } from "@/components/ui/list";
import type { VacancyDTO } from "@/lib/db/types";
import { formatAgo, formatSalary } from "@/lib/utils";

/** Vakansiya joylashuvi: "Toshkent, Chilonzor" */
export function vacancyLocation(vacancy: VacancyDTO, locale: "uz" | "uz-cyrl" | "ru"): string {
  const city = vacancy.cityName?.[locale] ?? "";
  const district = vacancy.districtName?.[locale];
  return district ? `${city}, ${district}` : city;
}

/**
 * Vakansiya qatori — v3 ning 3-bo'limidagi tuzilma:
 *
 *   [avatar 3rem]  Lavozim                    [vaqt]
 *                  Kompaniya · Hudud · Maosh  [belgi]
 *
 * Ikki qator: shunda balandlik aynan 4.75rem chiqadi. Avval uch qator edi
 * va qator 93px gacha cho'zilardi.
 */
export function VacancyRow({
  vacancy,
  last = false,
  showDistance = false,
  onOpen,
}: {
  vacancy: VacancyDTO;
  last?: boolean;
  showDistance?: boolean;
  onOpen: (vacancy: VacancyDTO) => void;
}) {
  const { t, locale } = useI18n();

  const place =
    showDistance && vacancy.distanceKm !== null
      ? `${vacancy.distanceKm} ${t.job.km}`
      : vacancyLocation(vacancy, locale);

  /*
   * v3 bu qatorni "Kompaniya · Hudud · Maosh" deb yozgan, lekin telefonda
   * uchchalasi sig'maydi va oxiri kesiladi. Maosh bilan hudud — qaror
   * qabul qilinadigan ikki fakt, shuning uchun ular oldinda; kesilsa
   * kompaniya nomi kesiladi.
   */
  const subtitle = [
    formatSalary(vacancy.salaryMin, vacancy.salaryMax, t.job.currency, t.job.negotiable),
    place,
    vacancy.company,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <ListItem
      leading={<Avatar name={vacancy.company} online={vacancy.fastReply} />}
      title={vacancy.professionName?.[locale] ?? vacancy.title}
      titleAdornment={
        <span className="flex items-center gap-1">
          {vacancy.verified && <IconShieldCheck size={15} className="text-accent" />}
          {vacancy.saved && <IconBookmark size={14} className="text-accent" />}
        </span>
      }
      subtitle={subtitle}
      strongTitle
      meta={formatAgo(vacancy.postedMinutesAgo, t.time)}
      trailing={vacancy.fastReply ? <Dot className="bg-success" /> : undefined}
      last={last}
      onClick={() => onOpen(vacancy)}
    />
  );
}
