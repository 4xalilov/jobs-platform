"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCheck, IconChevronRight, IconDocument } from "@/components/ui/icon";
import type { ApplicationDTO, ApplicationStatus } from "@/lib/db/types";
import { cacheKey } from "@/lib/idb";
import { useCachedList } from "@/lib/use-cached";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col gap-3">
        {applications.map((application) => (
          <div key={application.id} className="animate-row-in bg-surface">
            <button
              type="button"
              onClick={() => {
                if (application.chatId) router.push(`/chat/${application.chatId}`);
              }}
              className="tap-flat flex w-full items-center gap-3 px-4 pt-3.5 pb-2 text-left active:bg-surface-pressed"
            >
              <Avatar name={application.company} />
              <span className="min-w-0 flex-1">
                <span className="text-title block truncate text-fg">
                  {application.vacancyTitle}
                </span>
                <span className="mt-0.5 block truncate text-body text-fg-secondary">
                  {application.company}
                  {application.cityName ? ` · ${application.cityName[locale]}` : ""}
                </span>
              </span>
              <IconChevronRight size={20} className="shrink-0 text-fg-tertiary" />
            </button>

            {/* v2 6.4: to'rt bosqich, har biri vaqti bilan */}
            <ol className="flex px-4 pb-3.5">
              {ORDER.map((step, i) => {
                const entry = application.chain.find((item) => item.step === step);
                const reached = Boolean(entry?.at) || i <= ORDER.indexOf(application.status);
                const done = i < ORDER.indexOf(application.status);
                const current = step === application.status;

                return (
                  <li key={step} className="min-w-0 flex-1">
                    <span className="flex items-center">
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full",
                          reached ? "bg-accent text-on-accent" : "bg-fill",
                        )}
                      >
                        {done && <IconCheck size={11} />}
                      </span>
                      {i < ORDER.length - 1 && (
                        <span
                          className={cn(
                            "h-[2px] flex-1",
                            i < ORDER.indexOf(application.status) ? "bg-accent" : "bg-fill",
                          )}
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block pr-1 text-[0.6875rem] leading-[0.875rem]",
                        current ? "font-semibold text-fg" : "text-fg-tertiary",
                      )}
                    >
                      {t.screens.applications.status[step]}
                    </span>
                    {entry?.at && (
                      <span className="block text-[0.6875rem] leading-[0.875rem] text-fg-tertiary">
                        {dayLabel(entry.at)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>

            {/* 7 kun javob bo'lmasa — turtki va o'xshash vakansiyalar */}
            {application.stale && (
              <div className="border-t border-separator px-4 py-3">
                <p className="text-body text-fg-secondary">{t.screens.applications.stale}</p>
                {application.similar.length > 0 && (
                  <>
                    <p className="mt-2 text-caption text-fg-tertiary">{t.trust.similar}</p>
                    <div className="mt-1.5 flex flex-col gap-1.5">
                      {application.similar.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => router.push("/jobs")}
                          className="tap-flat rounded-tg-sm bg-fill px-3 py-2 text-left"
                        >
                          <span className="block truncate text-body text-fg">{item.title}</span>
                          <span className="block truncate text-caption text-fg-secondary">
                            {item.company}
                          </span>
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
