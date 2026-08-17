"use client";

import { Screen } from "@/components/app/screen";
import { useI18n } from "@/components/providers/i18n-provider";
import type { Dictionary } from "@/lib/i18n";
import { LoadingState } from "@/components/ui/state";
import { Skeleton, type SkeletonShape } from "@/components/ui/skeleton";
import styles from "./screen-loading.module.scss";

/**
 * `loading.tsx` uchun ekran qobig'i (v5, 2.8).
 *
 * Auditda 12 ta ro'yxat ekranidan 10 tasida skelet yo'q edi — sababi
 * ular serverda render bo'ladi va yuklanish holati mijozda emas,
 * marshrutda. Shuning uchun har segmentga `loading.tsx` qo'yiladi va
 * u shu qobiqni chaqiradi: panel darhol chiziladi, tanasi skelet
 * bo'ladi. Foydalanuvchi bosgan zahoti ekran o'zgaradi.
 *
 * Sarlavha jadval orqali i18n dan olinadi: `loading.tsx` server
 * komponenti, unga funksiya uzatib bo'lmaydi, matnni esa ikkinchi
 * marta yozish mumkin emas (v5, 1-bo'lim).
 */
const TITLES = {
  jobs: (t: Dictionary) => t.tabs.jobs,
  catalog: (t: Dictionary) => t.channels.catalog,
  applications: (t: Dictionary) => t.screens.applications.title,
  messages: (t: Dictionary) => t.tabs.messages,
  saved: (t: Dictionary) => t.tabs.saved,
  profile: (t: Dictionary) => t.tabs.profile,
  employerVacancies: (t: Dictionary) => t.employer.vacancies.title,
  employerCandidates: (t: Dictionary) => t.employer.candidates.title,
  employerSearch: (t: Dictionary) => t.trust.candidatesTitle,
  employerPlans: (t: Dictionary) => t.employer.plans.title,
} satisfies Record<string, (t: Dictionary) => string>;

export type ScreenKey = keyof typeof TITLES;

export function ScreenLoading({
  screen,
  shape = "list",
  rows,
  back,
}: {
  /** Sarlavha ma'lum bo'lsa — kalit; ma'lum bo'lmasa (kanal ichi) — `undefined` */
  screen?: ScreenKey;
  shape?: SkeletonShape;
  rows?: number;
  back?: boolean | string;
}) {
  const { t } = useI18n();

  return (
    <Screen
      back={back}
      title={
        screen ? (
          TITLES[screen](t)
        ) : (
          <Skeleton className={styles.titleSkeleton} aria-hidden="true" />
        )
      }
    >
      <LoadingState shape={shape} rows={rows} />
    </Screen>
  );
}
