"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { VacancyRow } from "@/components/jobs/vacancy-row";
import { VacancySheet } from "@/components/jobs/vacancy-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { IconClock, IconSearch } from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { SearchField } from "@/components/ui/search-field";
import { ListSkeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import type { Page, VacancyDTO } from "@/lib/db/types";
import { useRecentQueries } from "@/lib/stores";
import { useSheet } from "@/lib/use-sheet";

/** Qidiruv — bitta maydon va so'nggi qidiruvlar */
export default function SearchPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { queries, remember, clear } = useRecentQueries();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VacancyDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const vacancySheet = useSheet<VacancyDTO>();
  const debounce = useRef<number | null>(null);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const page = await apiGet<Page<VacancyDTO>>(
      `/vacancies?q=${encodeURIComponent(trimmed)}&limit=30`,
    );
    setResults(page.items);
    setLoading(false);
  }, []);

  // Yozilayotganda har harfga so'rov yubormaslik uchun kechikish
  const onChange = (value: string) => {
    setQuery(value);
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => void runSearch(value), 250);
  };

  useEffect(() => () => {
    if (debounce.current) window.clearTimeout(debounce.current);
  }, []);

  const trimmed = query.trim();

  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg">
      <div className="sticky top-0 z-20 flex items-center bg-surface pt-[env(safe-area-inset-top)] hairline">
        <SearchField
          value={query}
          onValueChange={onChange}
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
          {queries.length > 0 && (
            <ListGroup>
              {queries.map((item, i) => (
                <ListItem
                  key={item}
                  leading={<IconClock size={20} className="text-text-tertiary" />}
                  title={<span className="text-body font-normal">{item}</span>}
                  insetSeparator={false}
                  last={i === queries.length - 1}
                  onClick={() => {
                    setQuery(item);
                    void runSearch(item);
                  }}
                  className="py-2.5"
                />
              ))}
            </ListGroup>
          )}
        </>
      ) : loading ? (
        <ListGroup className="mt-2">
          <ListSkeleton rows={4} />
        </ListGroup>
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
                onOpen={(item) => {
                  remember(query);
                  vacancySheet.open(item);
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
        onChange={(updated) => {
          setResults((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          vacancySheet.replace(updated);
        }}
      />
    </div>
  );
}
