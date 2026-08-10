"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { VacancyRow } from "@/components/jobs/vacancy-row";
import { VacancySheet } from "@/components/jobs/vacancy-sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBookmark, IconTrash } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { SwipeListItem } from "@/components/ui/swipe-list-item";
import { apiPost } from "@/lib/api";
import type { VacancyDTO } from "@/lib/db/types";
import { useSheet } from "@/lib/use-sheet";

export function SavedList({ initial }: { initial: VacancyDTO[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const vacancySheet = useSheet<VacancyDTO>();

  // Optimistic: qator darhol yo'qoladi, so'rov keyin ketadi
  const remove = (vacancy: VacancyDTO) => {
    setItems((current) => current.filter((item) => item.id !== vacancy.id));
    void apiPost(`/vacancies/${vacancy.id}/save`).then(() => router.refresh());
  };

  return (
    <>
      <NavBar title={t.tabs.saved} className="sticky top-0 z-20 hairline" />

      {items.length === 0 ? (
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
          {items.map((vacancy, i) => (
            <SwipeListItem
              key={vacancy.id}
              actions={[
                {
                  key: "remove",
                  label: t.common.remove,
                  icon: <IconTrash size={20} />,
                  className: "bg-danger",
                  onAction: () => remove(vacancy),
                },
              ]}
            >
              <VacancyRow
                vacancy={vacancy}
                last={i === items.length - 1}
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
        onChange={(updated) => {
          vacancySheet.replace(updated);
          if (!updated.saved) setItems((c) => c.filter((item) => item.id !== updated.id));
        }}
      />
    </>
  );
}
