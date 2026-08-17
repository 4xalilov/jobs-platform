"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { IconCheck, IconChevronRight, IconDocument } from "@/components/ui/icon";
import type { ApplicationDTO, ApplicationStatus } from "@/lib/db/types";
import { cacheKey } from "@/lib/idb";
import { useCachedList } from "@/lib/use-cached";
import { cx } from "@/lib/utils";
import styles from "./application-list.module.scss";

const ORDER: ApplicationStatus[] = ["yuborildi", "korildi", "korib_chiqilmoqda", "javob_berildi"];

/**
 * Arizalarim — v2 da "Saqlangan" o'rniga kelgan bo'lim.
 * Sababi: ariza yuborgan odam ilovaga qaytishi uchun sabab kerak, holat
 * o'zgarishi esa shu sabab. Bu bildirishnoma uchun ham eng tabiiy bahona.
 */
export function ApplicationList({ applications: fromServer }: { applications: ApplicationDTO[] }) {
  // Oflaynda ro'yxat keshdan chiziladi
  const { items: applications } = useCachedList(cacheKey.applications(), fromServer);

  const { t, locale } = useI18n();
  const router = useRouter();

  if (applications.length === 0) {
    return (
      <Screen title={t.screens.applications.title}>
        <EmptyState
          icon={<IconDocument size={44} />}
          title={t.screens.applications.empty}
          hint={t.screens.applications.emptyHint}
          action={
            <Button variant="secondary" onClick={() => router.push("/jobs")}>
              {t.tabs.jobs}
            </Button>
          }
        />
      </Screen>
    );
  }

  /**
   * Sana qo'lda yig'iladi: brauzer uz-UZ ni bilmasligi mumkin va u holda
   * serverdagidan boshqacha chiqib, gidratsiya buziladi.
   */
  const dayLabel = (iso: string) => {
    const date = new Date(iso);
    return `${date.getDate()} ${t.time.months[date.getMonth()]}`;
  };

  return (
    <Screen title={t.screens.applications.title}>
      <div className={styles.list}>
        {applications.map((application) => (
          <div key={application.id} className={cx("animate-row-in", styles.card)}>
            <button
              type="button"
              onClick={() => {
                if (application.chatId) router.push(`/chat/${application.chatId}`);
              }}
              className={styles.head}
            >
              <Avatar name={application.company} />
              <span className={styles.headText}>
                <span className={styles.title}>{application.vacancyTitle}</span>
                <span className={styles.subtitle}>
                  {application.company}
                  {application.cityName ? ` · ${application.cityName[locale]}` : ""}
                </span>
              </span>
              <IconChevronRight size={20} className={styles.chevron} />
            </button>

            {/* v2 6.4: to'rt bosqich, har biri vaqti bilan */}
            <ol className={styles.chain}>
              {ORDER.map((step, i) => {
                const entry = application.chain.find((item) => item.step === step);
                const reached = Boolean(entry?.at) || i <= ORDER.indexOf(application.status);
                const done = i < ORDER.indexOf(application.status);
                const current = step === application.status;

                return (
                  <li key={step} className={styles.step}>
                    <span className={styles.track}>
                      <span className={cx(styles.dot, reached && styles.dotReached)}>
                        {done && <IconCheck size={11} />}
                      </span>
                      {i < ORDER.length - 1 && (
                        <span
                          className={cx(
                            styles.line,
                            i < ORDER.indexOf(application.status) && styles.lineDone,
                          )}
                        />
                      )}
                    </span>
                    <span className={cx(styles.stepLabel, current && styles.stepCurrent)}>
                      {t.screens.applications.status[step]}
                    </span>
                    {entry?.at && <span className={styles.stepDate}>{dayLabel(entry.at)}</span>}
                  </li>
                );
              })}
            </ol>

            {/* 7 kun javob bo'lmasa — turtki va o'xshash vakansiyalar */}
            {application.stale && (
              <div className={styles.nudge}>
                <p className={styles.nudgeText}>{t.screens.applications.stale}</p>
                {application.similar.length > 0 && (
                  <>
                    <p className={styles.similarTitle}>{t.trust.similar}</p>
                    <div className={styles.similarList}>
                      {application.similar.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => router.push("/jobs")}
                          className={styles.similarItem}
                        >
                          <span className={styles.similarName}>{item.title}</span>
                          <span className={styles.similarMeta}>{item.company}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}
