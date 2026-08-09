"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { VacancyRow } from "@/components/jobs/vacancy-row";
import { VacancySheet } from "@/components/jobs/vacancy-sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBookmark, IconTrash } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { SwipeListItem } from "@/components/ui/swipe-list-item";
import { vacancyById, type Vacancy } from "@/lib/mock-data";
import { useSaved } from "@/lib/stores";
import { useSheet } from "@/lib/use-sheet";
import { useRouter } from "next/navigation";

export default function SavedPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { ids, toggle } = useSaved();
  const vacancySheet = useSheet<Vacancy>();

  const saved = ids
    .map((id) => vacancyById(id))
    .filter((vacancy): vacancy is Vacancy => vacancy !== undefined);

  return (
    <>
      <NavBar title={t.tabs.saved} className="sticky top-0 z-20 hairline" />

      {saved.length === 0 ? (
        <EmptyState
          icon={<IconBookmark size={44} />}
          title={t.screens.saved.empty}
          hint={t.screens.saved.emptyHint}
          action={
            <Button variant="secondary" onClick={() => router.push("/jobs")}>
              {t.tabs.jobs}
            </Button>
          }
        />
      ) : (
        <ListGroup>
          {saved.map((vacancy, i) => (
            <SwipeListItem
              key={vacancy.id}
              actions={[
                {
                  key: "remove",
                  label: t.common.remove,
                  icon: <IconTrash size={20} />,
                  className: "bg-danger",
                  onAction: () => toggle(vacancy.id),
                },
              ]}
            >
              <VacancyRow
                vacancy={vacancy}
                saved
                last={i === saved.length - 1}
                onOpen={vacancySheet.open}
              />
            </SwipeListItem>
          ))}
        </ListGroup>
      )}

      <VacancySheet
        vacancy={vacancySheet.value}
        open={vacancySheet.isOpen}
        onClose={vacancySheet.close}
      />
    </>
  );
}
