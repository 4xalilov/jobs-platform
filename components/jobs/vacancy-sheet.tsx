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
import { formatSalary } from "@/lib/utils";

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
    onChange?.({ ...vacancy, applied: true, applications: vacancy.applications + 1 });
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
          <Button block size="lg" onClick={apply}>
            {t.common.apply}
          </Button>
        )
      }
    >
      <div className="px-4 pb-4">
        <div className="flex items-start gap-3">
          <Avatar name={vacancy.company} size={52} online={vacancy.fastReply} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[1.25rem] leading-6 font-semibold text-fg">
              {vacancy.professionName?.[locale] ?? vacancy.title}
            </h2>
            <p className="mt-0.5 truncate text-body text-fg-secondary">{vacancy.company}</p>
          </div>
          <button
            type="button"
            aria-label={t.common.save}
            aria-pressed={vacancy.saved}
            onClick={toggleSaved}
            className={vacancy.saved ? "p-1 text-accent" : "p-1 text-fg-tertiary"}
          >
            <IconBookmark size={24} />
          </button>
        </div>

        <p className="mt-3 text-[1.25rem] leading-6 font-semibold text-fg">
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

        {vacancy.description && <p className="mt-4 text-body text-fg">{vacancy.description}</p>}

        {/* v2 6.2: foiz emas, ro'yxat. Foiz ishonchni yo'qotadi,
            ro'yxat esa harakatga aylanadi. */}
        {vacancy.match && <MatchList match={vacancy.match} />}

        {/* v2 6.3: Telegram kanalida bunday ma'lumot yo'q — bu ustunlik */}
        <ResponseStats stats={vacancy.responseStats} />

        {/* v2: talablar erkin matn emas, tanlangan ro'yxat */}
        {vacancy.requirements.length > 0 && (
          <>
            <p className="mt-4 text-section text-fg-secondary uppercase">
              {t.employer.requirements.label}
            </p>
            <ul className="mt-2 space-y-1.5">
              {vacancy.requirements.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <IconCheck size={17} className="mt-0.5 shrink-0 text-accent" />
                  <span className="text-body text-fg">{t.employer.requirements[key]}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* v2 6.5: faqat raqam. Nomzodning o'rni ko'rsatilmaydi — uni
            tekshirib bo'lmaydi va noto'g'ri chiqsa ishonch yo'qoladi. */}
        <p className="mt-4 text-body text-fg-secondary">
          {vacancy.applications === 0
            ? t.trust.competitionFirst
            : t.trust.competition.replace("{count}", String(vacancy.applications))}
        </p>

        <div className="mt-3 flex gap-4 text-caption text-fg-tertiary">
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
    <div className="mt-4 rounded-tg bg-fill px-4 py-3">
      <p className="text-body font-semibold text-fg">
        {t.trust.match
          .replace("{matched}", String(match.matched))
          .replace("{total}", String(match.total))}
      </p>
      <ul className="mt-2.5 space-y-2">
        {match.items.map((item) => (
          <li key={item.key} className="flex items-start gap-2">
            {item.ok ? (
              <IconCheck size={17} className="mt-0.5 shrink-0 text-success" />
            ) : (
              <IconX size={17} className="mt-0.5 shrink-0 text-fg-tertiary" />
            )}
            <span className="min-w-0">
              <span className={item.ok ? "text-body text-fg" : "text-body text-fg-secondary"}>
                {label[item.key]}: {value(item.key, item.required)}
              </span>
              {!item.ok && (
                <span className="block text-caption text-fg-tertiary">
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
      <p className="mt-4 text-section text-fg-secondary uppercase">{t.trust.responseTitle}</p>
      <ul className="mt-2 space-y-1">
        <li className="text-body text-fg">
          {stats.rate === null
            ? t.trust.responseNone
            : t.trust.responseRate.replace("{rate}", String(stats.rate))}
        </li>
        {time && (
          <li className="text-body text-fg-secondary">
            {t.trust.responseTime.replace("{value}", time)}
          </li>
        )}
        <li className="text-body text-fg-secondary">{lastActive}</li>
      </ul>
    </>
  );
}
