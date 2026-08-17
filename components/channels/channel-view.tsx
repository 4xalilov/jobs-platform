"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { VacancyRow } from "@/components/jobs/vacancy-row";

import { Button } from "@/components/ui/button";
import { IconBriefcase } from "@/components/ui/icon";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { haptic } from "@/lib/haptics";
import { apiGet, apiPost } from "@/lib/api";
import { EMPLOYMENT_TYPES } from "@/lib/db/types";
import type { ChannelDTO, EmploymentType, Page, VacancyDTO } from "@/lib/db/types";
import { cx } from "@/lib/utils";
import { useSheet } from "@/lib/use-sheet";
import { useRouter } from "next/navigation";
import styles from "./channel-view.module.scss";

/** Tanlangan chip saqlanadi — foydalanuvchi qaytganda o'sha filtr turadi */
const FILTER_KEY = "ish.channelFilter";

type Filter = EmploymentType | "all";

/** Vakansiyalar vaqt bo'yicha guruhlanadi (§4.3) */
type WhenKey = "today" | "yesterday" | "thisWeek" | "earlier";

function whenOf(minutesAgo: number): WhenKey {
  if (minutesAgo < 60 * 24) return "today";
  if (minutesAgo < 60 * 48) return "yesterday";
  if (minutesAgo < 60 * 24 * 7) return "thisWeek";
  return "earlier";
}

/*
 * Vakansiya sheeti alohida bo'lakka chiqariladi va faqat ochilganda
 * render qilinadi. Doim render qilinsa (ichida null qaytarsa ham)
 * dynamic() bo'lakni darrov yuklab oladi va butun ma'no yo'qoladi.
 */
const VacancySheet = dynamic(
  () => import("@/components/jobs/vacancy-sheet").then((m) => m.VacancySheet),
  { ssr: false },
);

export function ChannelView({
  channel,
  initial,
}: {
  channel: ChannelDTO;
  initial: Page<VacancyDTO>;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.cursor);
  const [filter, setFilter] = useState<Filter>("all");
  const [subscribed, setSubscribed] = useState(channel.subscribed);
  const [subscribers, setSubscribers] = useState(channel.subscriberCount);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const vacancySheet = useSheet<VacancyDTO>();

  // Saqlangan filtrni tiklash
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved && (saved === "all" || EMPLOYMENT_TYPES.includes(saved as EmploymentType))) {
      if (saved !== "all") void applyFilter(saved as Filter);
    }
    // Faqat birinchi renderda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(
    async (nextFilter: Filter, nextCursor: string | null) => {
      const params = new URLSearchParams();
      if (nextFilter !== "all") params.set("bandlik", nextFilter);
      if (nextCursor) params.set("cursor", nextCursor);
      return apiGet<Page<VacancyDTO>>(`/channels/${channel.id}/vacancies?${params.toString()}`);
    },
    [channel.id],
  );

  async function applyFilter(next: Filter) {
    setFilter(next);
    localStorage.setItem(FILTER_KEY, next);
    setLoading(true);
    setFailed(null);
    try {
      const page = await load(next, null);
      setItems(page.items);
      setCursor(page.cursor);
    } catch (error) {
      /*
       * Filtr almashganda ro'yxat serverdan qayta olinadi va tarmoq
       * uzilsa ekran bo'sh qolardi — endi sababi va qayta urinish bor.
       */
      setFailed(error instanceof Error ? error.message : "");
      setItems([]);
      setCursor(null);
    }
    setLoading(false);
  }

  // Cheksiz aylanish
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !cursor || loading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        setLoading(true);
        try {
          const page = await load(filter, cursor);
          setItems((prev) => [...prev, ...page.items]);
          setCursor(page.cursor);
        } catch {
          /*
           * Keyingi sahifa kelmasa allaqachon ko'rsatilgan ro'yxat
           * o'chirilmaydi: kursorni saqlab qo'yamiz, foydalanuvchi
           * yana pastga tortsa qayta uriniladi.
           */
        }
        setLoading(false);
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, filter, load, loading]);

  const toggleSubscribe = () => {
    haptic("select");
    const next = !subscribed;
    setSubscribed(next);
    setSubscribers((n) => n + (next ? 1 : -1));
    void apiPost(`/channels/${channel.id}/subscribe`, {});
  };

  // Chip qatori: "Hammasi" + kanalda haqiqatan mavjud bandlik turlari
  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: t.common.all, count: channel.vacancyCount },
    ...EMPLOYMENT_TYPES.filter((type) => (channel.employmentCounts[type] ?? 0) > 0).map((type) => ({
      key: type as Filter,
      label: t.job.employment[type],
      count: channel.employmentCounts[type] ?? 0,
    })),
  ];

  /*
   * Ro'yxatni vaqt bo'yicha bo'laklarga ajratamiz.
   *
   * Ketma-ket kelganlarni guruhlash yetmaydi: saralashga javob
   * ko'rsatkichi ham qo'shilgani uchun (past javob beradigan vakansiya
   * pastroq tushadi) tartib qat'iy xronologik emas, va "KECHA" sarlavhasi
   * ikki marta chiqib qolardi. Shuning uchun elementlar aniq to'rt
   * chelakka joylanadi, har sarlavha bir marta chiqadi; chelak ichidagi
   * tartib esa serverdan kelganicha qoladi.
   */
  const buckets = new Map<WhenKey, VacancyDTO[]>();
  for (const vacancy of items) {
    const key = whenOf(vacancy.postedMinutesAgo);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(vacancy);
    else buckets.set(key, [vacancy]);
  }
  const WHEN_ORDER: WhenKey[] = ["today", "yesterday", "thisWeek", "earlier"];
  const sections = WHEN_ORDER.filter((key) => buckets.has(key)).map((key) => ({
    key,
    items: buckets.get(key) as VacancyDTO[],
  }));

  return (
    <Screen
      title={channel.name[locale]}
      subtitle={t.channels.subscribers.replace("{count}", String(subscribers))}
      back="/jobs"
      trailing={
        <button
          type="button"
          onClick={toggleSubscribe}
          className={cx(styles.subscribe, subscribed && styles.subscribed)}
        >
          {subscribed ? t.channels.subscribed : t.channels.subscribe}
        </button>
      }
    >
      <div className={cx(styles.chips, "hairline")}>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            aria-pressed={filter === chip.key}
            onClick={() => void applyFilter(chip.key)}
            className={cx(styles.chip, filter === chip.key && styles.chipActive)}
          >
            {chip.label}
            <span className={styles.chipCount}>{chip.count}</span>
          </button>
        ))}
      </div>

      {loading && items.length === 0 ? (
        <LoadingState shape="vacancy" rows={6} />
      ) : failed !== null ? (
        <ErrorState reason={failed || undefined} onRetry={() => void applyFilter(filter)} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={44} />}
          title={t.channels.emptyChannel}
          hint={filter === "all" ? t.channels.emptyChannelHint : t.channels.emptyFilterHint}
          action={
            /* Filtr sababchi bo'lsa uni olib tashlash, aks holda boshqa kanalga o'tish */
            filter === "all" ? (
              <Button variant="secondary" onClick={() => router.push("/jobs/katalog")}>
                {t.channels.browse}
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => void applyFilter("all")}>
                {t.common.all}
              </Button>
            )
          }
        />
      ) : (
        <div className={styles.list} key={filter}>
          {sections.map((section) => (
            <section key={section.key}>
              <h2 className={styles.when}>{t.channels.when[section.key]}</h2>
              <div className={styles.group}>
                {section.items.map((vacancy, index) => (
                  <VacancyRow
                    key={vacancy.id}
                    vacancy={vacancy}
                    last={index === section.items.length - 1}
                    onOpen={vacancySheet.open}
                  />
                ))}
              </div>
            </section>
          ))}
          <div ref={sentinel} />
          {!cursor && <p className={styles.end}>{t.screens.jobs.endOfList}</p>}
        </div>
      )}

      {vacancySheet.isOpen && (
        <VacancySheet
          vacancy={vacancySheet.value}
          open={vacancySheet.isOpen}
          onClose={vacancySheet.close}
          onChange={(next) => setItems((prev) => prev.map((v) => (v.id === next.id ? next : v)))}
        />
      )}
    </Screen>
  );
}
