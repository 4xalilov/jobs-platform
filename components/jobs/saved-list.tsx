"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { VacancyRow } from "@/components/jobs/vacancy-row";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { IconBookmark, IconTrash } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list";
import { SwipeListItem } from "@/components/ui/swipe-list-item";
import { apiPost } from "@/lib/api";
import type { VacancyDTO } from "@/lib/db/types";
import { useSheet } from "@/lib/use-sheet";

/*
 * Vakansiya sheeti alohida bo'lakka chiqariladi va faqat ochilganda
 * render qilinadi. Doim render qilinsa (ichida null qaytarsa ham)
 * dynamic() bo'lakni darrov yuklab oladi va butun ma'no yo'qoladi.
 */
const VacancySheet = dynamic(
  () => import("@/components/jobs/vacancy-sheet").then((m) => m.VacancySheet),
  { ssr: false },
);

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
    <Screen title={t.tabs.saved} back="/profile">
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
                  tone: "danger",
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

      {vacancySheet.isOpen && (
        <VacancySheet
          vacancy={vacancySheet.value}
          open={vacancySheet.isOpen}
          onClose={vacancySheet.close}
          onChange={(updated) => {
            vacancySheet.replace(updated);
            if (!updated.saved) setItems((c) => c.filter((item) => item.id !== updated.id));
          }}
        />
      )}
    </Screen>
  );
}
