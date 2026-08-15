"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { IconBookmark, IconShieldCheck } from "@/components/ui/icon";
import type { VacancyDTO } from "@/lib/db/types";
import { cx, formatAgo, formatSalaryShort } from "@/lib/utils";
import styles from "./vacancy-row.module.scss";

/** Vakansiya joylashuvi: "Toshkent, Chilonzor" */
export function vacancyLocation(vacancy: VacancyDTO, locale: "uz" | "uz-cyrl" | "ru"): string {
  const city = vacancy.cityName?.[locale] ?? "";
  const district = vacancy.districtName?.[locale];
  return district ? `${city}, ${district}` : city;
}

/** 24 soat ichida joylashtirilgan bo'lsa "Yangi" belgisi chiqadi */
const NEW_MINUTES = 24 * 60;

/**
 * Vakansiya qatori — v4 ning 4.1-bo'limidagi to'rt qatorli tuzilma:
 *
 *   [avatar 3rem]  Oshpaz                        ● Yangi
 *                  Chaykhana Navruz · Yunusobod  2 soat
 *                  5–7 mln so'm  [To'liq kun]
 *                  ● 80% javob beradi · 4 ariza
 *
 * Balandlik 6rem. Rang bezak emas, ma'lumot tashiydi: maosh yashil,
 * javob ko'rsatkichi nuqtasi darajaga qarab yashil/sariq/kulrang.
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

  const isNew = vacancy.postedMinutesAgo < NEW_MINUTES;
  const negotiable = !vacancy.salaryMin && !vacancy.salaryMax;
  const rate = vacancy.responseStats.rate;

  // Ish beruvchi haqida bitta qator: javob ko'rsatkichi va raqobat
  const stats = [
    rate === null ? null : t.channels.replyRate.replace("{rate}", String(rate)),
    vacancy.applications > 0
      ? t.channels.applicationCount.replace("{count}", String(vacancy.applications))
      : null,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={() => onOpen(vacancy)}
      className={cx(styles.row, !last && "hairline hairline-inset")}
    >
      <Avatar name={vacancy.company} online={vacancy.fastReply} />

      <span className={styles.main}>
        <span className={styles.titleLine}>
          <span className={styles.title}>{vacancy.professionName?.[locale] ?? vacancy.title}</span>
          {vacancy.verified && (
            <span className={styles.verified}>
              <IconShieldCheck size={15} />
            </span>
          )}
          {isNew && (
            <span className={styles.new}>
              <i className={styles.newDot} />
              {t.channels.isNew}
            </span>
          )}
        </span>

        <span className={styles.metaLine}>
          <span className={styles.where}>
            {[vacancy.company, place].filter(Boolean).join(" · ")}
          </span>
          <span className={styles.time}>{formatAgo(vacancy.postedMinutesAgo, t.time)}</span>
        </span>

        <span className={styles.salaryLine}>
          <span className={cx(styles.salary, negotiable && styles.negotiable)}>
            {formatSalaryShort(
              vacancy.salaryMin,
              vacancy.salaryMax,
              t.job.millionShort,
              t.job.currency,
              t.job.negotiable,
            )}
          </span>
          <span className={styles.employment}>{t.job.employment[vacancy.employment]}</span>
          {vacancy.urgent && (
            <span className={cx(styles.employment, styles.urgent)}>{t.channels.urgent}</span>
          )}
          {vacancy.saved && (
            <span className={styles.saved}>
              <IconBookmark size={14} />
            </span>
          )}
        </span>

        {stats.length > 0 && (
          <span className={styles.statsLine}>
            <i
              className={cx(
                styles.rateDot,
                rate !== null && rate >= 80 && styles.rateGood,
                rate !== null && rate >= 40 && rate < 80 && styles.rateMid,
              )}
            />
            <span className={styles.statsText}>{stats.join(" · ")}</span>
          </span>
        )}
      </span>
    </button>
  );
}
