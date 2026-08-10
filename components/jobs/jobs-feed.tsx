"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { VacancyRow } from "@/components/jobs/vacancy-row";
import { VacancySheet } from "@/components/jobs/vacancy-sheet";
import { Chip, ChipRow } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBookmark, IconBriefcase, IconCheck, IconSliders } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { SearchFieldButton } from "@/components/ui/search-field";
import { Sheet } from "@/components/ui/sheet";
import { ListSkeleton } from "@/components/ui/skeleton";
import { SwipeListItem } from "@/components/ui/swipe-list-item";
import { apiGet, apiPost } from "@/lib/api";
import type { Page, ProfessionDTO, VacancyDTO } from "@/lib/db/types";
import { useSheet } from "@/lib/use-sheet";

type SortKey = "new" | "nearby" | "salary";

/** Geolokatsiya bo'lmasa — Toshkent markazi */
const FALLBACK_POINT = { lat: 41.3111, lng: 69.2406 };

export function JobsFeed({
  initial,
  professions,
}: {
  initial: Page<VacancyDTO>;
  professions: ProfessionDTO[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.cursor);
  const [profession, setProfession] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("new");
  const [loading, setLoading] = useState(false);
  const [point, setPoint] = useState(FALLBACK_POINT);

  const vacancySheet = useSheet<VacancyDTO>();
  const sortSheet = useSheet<true>();
  const sentinel = useRef<HTMLDivElement>(null);

  // Qidiruv maydoni yuqorida turadi — pastga tortilganda chiqadi
  useEffect(() => {
    if (window.scrollY === 0) window.scrollTo({ top: 52, behavior: "instant" });
  }, []);

  // Brauzer joylashuvni bersa — masofa shundan hisoblanadi
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setPoint({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => undefined,
      { timeout: 4000, maximumAge: 600_000 },
    );
  }, []);

  const buildQuery = useCallback(
    (nextSort: SortKey, nextProfession: string | null, nextCursor: string | null) => {
      const params = new URLSearchParams({ sort: nextSort, limit: "12" });
      if (nextProfession) params.set("kasb", nextProfession);
      if (nextCursor) params.set("cursor", nextCursor);
      if (nextSort === "nearby") {
        params.set("lat", String(point.lat));
        params.set("lng", String(point.lng));
      }
      return `/vacancies?${params}`;
    },
    [point],
  );

  const reload = async (nextSort: SortKey, nextProfession: string | null) => {
    setLoading(true);
    const page = await apiGet<Page<VacancyDTO>>(buildQuery(nextSort, nextProfession, null));
    setItems(page.items);
    setCursor(page.cursor);
    setLoading(false);
    window.scrollTo({ top: 52, behavior: "instant" });
  };

  // Cheksiz aylanish — sahifalash tugmasi yo'q
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !cursor) return;

    const observer = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting || loading) return;
      setLoading(true);
      const page = await apiGet<Page<VacancyDTO>>(buildQuery(sort, profession, cursor));
      setItems((current) => [...current, ...page.items]);
      setCursor(page.cursor);
      setLoading(false);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, loading, sort, profession, buildQuery]);

  const patch = (updated: VacancyDTO) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    if (vacancySheet.value?.id === updated.id) vacancySheet.replace(updated);
  };

  const toggleSaved = (vacancy: VacancyDTO) => {
    patch({ ...vacancy, saved: !vacancy.saved });
    void apiPost(`/vacancies/${vacancy.id}/save`).then(() => router.refresh());
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "new", label: t.screens.jobs.sortNew },
    { key: "nearby", label: t.screens.jobs.sortNearby },
    { key: "salary", label: t.screens.jobs.sortSalary },
  ];

  return (
    <>
      <NavBar
        title={t.tabs.jobs}
        trailing={
          <button
            type="button"
            aria-label={t.screens.jobs.sort}
            onClick={() => sortSheet.open(true)}
            className="p-2 text-accent"
          >
            <IconSliders size={22} />
          </button>
        }
        className="sticky top-0 z-20 hairline"
      />

      <div className="bg-surface">
        <SearchFieldButton
          placeholder={t.screens.search.placeholder}
          onClick={() => router.push("/search")}
        />
      </div>

      <div className="sticky top-11 z-20 bg-surface hairline">
        <ChipRow>
          <Chip
            selected={profession === null}
            onClick={() => {
              setProfession(null);
              void reload(sort, null);
            }}
          >
            {t.common.all}
          </Chip>
          {professions.map((item) => (
            <Chip
              key={item.id}
              selected={profession === item.id}
              onClick={() => {
                setProfession(item.id);
                void reload(sort, item.id);
              }}
            >
              {item.name[locale]}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={<IconBriefcase size={44} />}
          title={t.screens.jobs.empty}
          hint={t.screens.jobs.emptyHint}
        />
      ) : (
        <ListGroup className="mt-2">
          {items.map((vacancy, i) => (
            <SwipeListItem
              key={vacancy.id}
              actions={[
                {
                  key: "save",
                  label: vacancy.saved ? t.common.saved : t.common.save,
                  icon: <IconBookmark size={20} />,
                  className: "bg-accent",
                  onAction: () => toggleSaved(vacancy),
                },
              ]}
            >
              <VacancyRow
                vacancy={vacancy}
                showDistance={sort === "nearby"}
                last={i === items.length - 1 && !cursor}
                onOpen={vacancySheet.open}
              />
            </SwipeListItem>
          ))}
        </ListGroup>
      )}

      {cursor && (
        <div ref={sentinel}>
          {loading ? <ListSkeleton rows={3} /> : <div className="h-20" aria-hidden="true" />}
        </div>
      )}

      {!cursor && items.length > 0 && (
        <p className="py-6 text-center text-caption text-text-tertiary">
          {t.screens.jobs.endOfList}
        </p>
      )}

      <VacancySheet
        vacancy={vacancySheet.value}
        open={vacancySheet.isOpen}
        onClose={vacancySheet.close}
        onChange={patch}
      />

      <Sheet
        open={sortSheet.isOpen}
        onClose={sortSheet.close}
        closeLabel={t.common.close}
        title={t.screens.jobs.sort}
      >
        <ListGroup>
          {sortOptions.map((option, i) => (
            <ListItem
              key={option.key}
              title={<span className="text-body font-normal">{option.label}</span>}
              insetSeparator={false}
              last={i === sortOptions.length - 1}
              trailing={
                sort === option.key ? <IconCheck size={20} className="text-accent" /> : undefined
              }
              onClick={() => {
                setSort(option.key);
                sortSheet.close();
                void reload(option.key, profession);
              }}
              className="py-3"
            />
          ))}
        </ListGroup>
        <div className="h-4" />
      </Sheet>
    </>
  );
}
