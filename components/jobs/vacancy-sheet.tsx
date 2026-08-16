"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { vacancyLocation } from "@/components/jobs/vacancy-row";
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
  IconX,
} from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { apiPost } from "@/lib/api";
import type { MatchDTO, ResponseStatsDTO, VacancyDTO } from "@/lib/db/types";
import { cx, formatSalary } from "@/lib/utils";
import shared from "@/styles/shared.module.scss";
import styles from "./vacancy-sheet.module.scss";

/**
 * Vakansiya sahifasi — pastdan ko'tariladigan sheet.
 * Yuqorida lavozim va maosh, keyin qisqa tavsif, pastda bitta katta tugma.
 */
export function VacancySheet({
  vacancy,
  open,
  onClose,
  onChange,
}: {
  vacancy: VacancyDTO | null;
  open: boolean;
  onClose: () => void;
  /** Ariza yoki saqlash holati o'zgarganda ro'yxatni yangilash uchun */
  onChange?: (vacancy: VacancyDTO) => void;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  if (!vacancy) return null;

  // Optimistic UI: javob kutilmaydi, holat darhol o'zgaradi
  const apply = () => {
    onChange?.({
      ...vacancy,
      applied: true,
      applications: vacancy.applications + 1,
    });
    void apiPost(`/vacancies/${vacancy.id}/apply`).then(() => router.refresh());
  };

  const toggleSaved = () => {
    onChange?.({ ...vacancy, saved: !vacancy.saved });
    void apiPost(`/vacancies/${vacancy.id}/save`).then(() => router.refresh());
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      closeLabel={t.common.close}
      footer={
        vacancy.applied ? (
          <div className={styles.footerRow}>
            <Button variant="secondary" size="lg" className={styles.footerMain} disabled>
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
          <Button block size="lg" onClick={apply}>
            {t.common.apply}
          </Button>
        )
      }
    >
      <div className={shared.sheetBody}>
        <div className={styles.head}>
          <Avatar name={vacancy.company} size={52} online={vacancy.fastReply} />
          <div className={styles.headText}>
            <h2 className={shared.sheetTitle}>
              {vacancy.professionName?.[locale] ?? vacancy.title}
            </h2>
            <p className={styles.company}>{vacancy.company}</p>
          </div>
          <button
            type="button"
            aria-label={t.common.save}
            aria-pressed={vacancy.saved}
            onClick={toggleSaved}
            className={cx(styles.save, vacancy.saved && styles.saveActive)}
          >
            <IconBookmark size={24} />
          </button>
        </div>

        <p className={styles.salary}>
          {formatSalary(vacancy.salaryMin, vacancy.salaryMax, t.job.currency, t.job.negotiable)}
        </p>

        <div className={shared.tagRow}>
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

        {vacancy.description && <p className={styles.description}>{vacancy.description}</p>}

        {/* v2 6.2: foiz emas, ro'yxat. Foiz ishonchni yo'qotadi,
            ro'yxat esa harakatga aylanadi. */}
        {vacancy.match && <MatchList match={vacancy.match} />}

        {/* v2 6.3: Telegram kanalida bunday ma'lumot yo'q — bu ustunlik */}
        <ResponseStats stats={vacancy.responseStats} />

        {/* v2: talablar erkin matn emas, tanlangan ro'yxat */}
        {vacancy.requirements.length > 0 && (
          <>
            <p className={styles.sectionLabel}>{t.employer.requirements.label}</p>
            <ul className={styles.checkList}>
              {vacancy.requirements.map((key) => (
                <li key={key} className={styles.checkItem}>
                  <IconCheck size={17} className={styles.checkIcon} />
                  <span className={styles.checkText}>{t.employer.requirements[key]}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* v2 6.5: faqat raqam. Nomzodning o'rni ko'rsatilmaydi — uni
            tekshirib bo'lmaydi va noto'g'ri chiqsa ishonch yo'qoladi. */}
        <p className={styles.competition}>
          {vacancy.applications === 0
            ? t.trust.competitionFirst
            : t.trust.competition.replace("{count}", String(vacancy.applications))}
        </p>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <IconEye size={15} /> {vacancy.views} {t.job.views}
          </span>
          <span className={styles.stat}>
            <IconUsers size={15} /> {vacancy.applications} {t.job.applications}
          </span>
        </div>
      </div>
    </Sheet>
  );
}

/** Moslik ro'yxati — mos kelmagani kulrang, ostida nima yetishmasligi */
function MatchList({ match }: { match: MatchDTO }) {
  const { t } = useI18n();

  const label: Record<MatchDTO["items"][number]["key"], string> = {
    profession: t.trust.matchProfession,
    city: t.trust.matchCity,
    experience: t.trust.matchExperience,
    employment: t.trust.matchEmployment,
  };

  const value = (key: string, raw: string | null) => {
    if (!raw) return null;
    if (key === "experience") return t.job.experience[raw as keyof typeof t.job.experience] ?? raw;
    if (key === "employment") return t.job.employment[raw as keyof typeof t.job.employment] ?? raw;
    return raw;
  };

  return (
    <div className={styles.match}>
      <p className={styles.matchTitle}>
        {t.trust.match
          .replace("{matched}", String(match.matched))
          .replace("{total}", String(match.total))}
      </p>
      <ul className={styles.matchList}>
        {match.items.map((item) => (
          <li key={item.key} className={styles.matchItem}>
            {item.ok ? (
              <IconCheck size={17} className={styles.matchIconOk} />
            ) : (
              <IconX size={17} className={styles.matchIconMissing} />
            )}
            <span className={styles.matchText}>
              <span className={cx(styles.matchLabel, !item.ok && styles.matchLabelMissing)}>
                {label[item.key]}: {value(item.key, item.required)}
              </span>
              {!item.ok && (
                <span className={styles.matchMine}>
                  {t.trust.matchYours}: {value(item.key, item.mine) ?? t.trust.matchMissing}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Javob ko'rsatkichi — ochiq ko'rsatiladi, yashirilmaydi */
function ResponseStats({ stats }: { stats: ResponseStatsDTO }) {
  const { t } = useI18n();

  const time =
    stats.averageHours === null
      ? null
      : stats.averageHours < 24
        ? t.trust.responseHours.replace("{count}", String(Math.max(1, stats.averageHours)))
        : t.trust.responseDays.replace("{count}", String(Math.round(stats.averageHours / 24)));

  const lastActive =
    stats.lastActiveDays === null
      ? t.trust.lastActiveNever
      : stats.lastActiveDays === 0
        ? t.trust.lastActiveToday
        : t.trust.lastActiveDays.replace("{count}", String(stats.lastActiveDays));

  return (
    <>
      <p className={styles.sectionLabel}>{t.trust.responseTitle}</p>
      <ul className={styles.statsList}>
        <li className={styles.statsPrimary}>
          {stats.rate === null
            ? t.trust.responseNone
            : t.trust.responseRate.replace("{rate}", String(stats.rate))}
        </li>
        {time && (
          <li className={styles.statsSecondary}>{t.trust.responseTime.replace("{value}", time)}</li>
        )}
        <li className={styles.statsSecondary}>{lastActive}</li>
      </ul>
    </>
  );
}
