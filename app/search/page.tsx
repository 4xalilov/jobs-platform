"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { VacancyRow } from "@/components/jobs/vacancy-row";
import { VacancySheet } from "@/components/jobs/vacancy-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { IconClock, IconSearch } from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { SearchField } from "@/components/ui/search-field";
import {
  cityById,
  professionById,
  recentSearches,
  vacancies,
  type Vacancy,
} from "@/lib/mock-data";
import { useRecentQueries } from "@/lib/stores";
import { useSheet } from "@/lib/use-sheet";

export default function SearchPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { queries, remember, clear } = useRecentQueries();

  const [query, setQuery] = useState("");
  const vacancySheet = useSheet<Vacancy>();

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return vacancies.filter((vacancy) => {
      const profession = professionById(vacancy.professionId);
      const city = cityById(vacancy.cityId);
      const haystack = [
        profession ? profession.name[locale] : "",
        vacancy.company,
        city ? city.name[locale] : "",
        vacancy.district ? vacancy.district[locale] : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, locale]);

  // Foydalanuvchi yozganlari + namunaviy so'rovlar
  const recents = [...queries, ...recentSearches.map((r) => r[locale])].filter(
    (value, index, all) => all.indexOf(value) === index,
  );

  const trimmed = query.trim();

  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="sticky top-0 z-20 flex items-center bg-surface pt-[env(safe-area-inset-top)] hairline">
        <SearchField
          value={query}
          onValueChange={setQuery}
          placeholder={t.screens.search.placeholder}
          clearLabel={t.common.close}
          autoFocus
          className="flex-1 pr-0"
        />
        <button
          type="button"
          onClick={() => {
            remember(query);
            router.back();
          }}
          className="px-4 text-body font-medium text-accent"
        >
          {t.common.cancel}
        </button>
      </div>

      {trimmed === "" ? (
        <>
          <SectionHeader
            action={
              queries.length > 0 ? (
                <button
                  type="button"
                  onClick={clear}
                  className="text-caption font-medium text-accent"
                >
                  {t.screens.search.clearAll}
                </button>
              ) : undefined
            }
          >
            {t.screens.search.recent}
          </SectionHeader>
          <ListGroup>
            {recents.map((item, i) => (
              <ListItem
                key={item}
                leading={<IconClock size={20} className="text-text-tertiary" />}
                title={<span className="text-body font-normal">{item}</span>}
                insetSeparator={false}
                last={i === recents.length - 1}
                onClick={() => setQuery(item)}
                className="py-2.5"
              />
            ))}
          </ListGroup>
        </>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={44} />}
          title={t.screens.search.noResults}
          hint={t.screens.search.noResultsHint}
        />
      ) : (
        <>
          <SectionHeader>{t.screens.search.results}</SectionHeader>
          <ListGroup>
            {results.map((vacancy, i) => (
              <VacancyRow
                key={vacancy.id}
                vacancy={vacancy}
                last={i === results.length - 1}
                onOpen={(v) => {
                  remember(query);
                  vacancySheet.open(v);
                }}
              />
            ))}
          </ListGroup>
        </>
      )}

      <VacancySheet
        vacancy={vacancySheet.value}
        open={vacancySheet.isOpen}
        onClose={vacancySheet.close}
      />
    </div>
  );
}
