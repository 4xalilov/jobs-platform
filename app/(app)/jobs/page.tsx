"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { professions, vacancies, type Vacancy } from "@/lib/mock-data";
import { useSaved } from "@/lib/stores";
import { useSheet } from "@/lib/use-sheet";

type SortKey = "new" | "nearby" | "salary";

const PAGE_SIZE = 12;

export default function JobsPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { isSaved, toggle } = useSaved();

  const [profession, setProfession] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("new");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const vacancySheet = useSheet<Vacancy>();
  const sortSheet = useSheet<true>();
  const sentinel = useRef<HTMLDivElement>(null);

  // Qidiruv maydoni yuqorida turadi — pastga tortilganda chiqadi
  useEffect(() => {
    if (window.scrollY === 0) window.scrollTo({ top: 52, behavior: "instant" });
  }, []);

  const filtered = useMemo(() => {
    const list = profession
      ? vacancies.filter((v) => v.professionId === profession)
      : vacancies.slice();

    if (sort === "nearby") return list.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "salary") {
      return list.sort(
        (a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0),
      );
    }
    return list.sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
  }, [profession, sort]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Cheksiz aylanish — sahifalash tugmasi yo'q
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      setLoadingMore(true);
      window.setTimeout(() => {
        setVisible((v) => v + PAGE_SIZE);
        setLoadingMore(false);
      }, 350);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const changeFilter = (next: string | null) => {
    setProfession(next);
    setVisible(PAGE_SIZE);
    window.scrollTo({ top: 52, behavior: "instant" });
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
          <Chip selected={profession === null} onClick={() => changeFilter(null)}>
            {t.common.all}
          </Chip>
          {professions.map((p) => (
            <Chip
              key={p.id}
              selected={profession === p.id}
              onClick={() => changeFilter(p.id)}
            >
              {p.name[locale]}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={44} />}
          title={t.screens.jobs.empty}
          hint={t.screens.jobs.emptyHint}
        />
      ) : (
        <ListGroup className="mt-2">
          {shown.map((vacancy, i) => (
            <SwipeListItem
              key={vacancy.id}
              actions={[
                {
                  key: "save",
                  label: isSaved(vacancy.id) ? t.common.saved : t.common.save,
                  icon: <IconBookmark size={20} />,
                  className: "bg-accent",
                  onAction: () => toggle(vacancy.id),
                },
              ]}
            >
              <VacancyRow
                vacancy={vacancy}
                saved={isSaved(vacancy.id)}
                showDistance={sort === "nearby"}
                last={i === shown.length - 1 && !hasMore}
                onOpen={vacancySheet.open}
              />
            </SwipeListItem>
          ))}
        </ListGroup>
      )}

      {hasMore && (
        <div ref={sentinel}>
          {loadingMore ? (
            <ListSkeleton rows={3} />
          ) : (
            <div className="h-20" aria-hidden="true" />
          )}
        </div>
      )}

      {!hasMore && shown.length > 0 && (
        <p className="py-6 text-center text-caption text-text-tertiary">
          {t.screens.jobs.endOfList}
        </p>
      )}

      <VacancySheet
        vacancy={vacancySheet.value}
        open={vacancySheet.isOpen}
        onClose={vacancySheet.close}
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
                sort === option.key ? (
                  <IconCheck size={20} className="text-accent" />
                ) : undefined
              }
              onClick={() => {
                setSort(option.key);
                setVisible(PAGE_SIZE);
                sortSheet.close();
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
