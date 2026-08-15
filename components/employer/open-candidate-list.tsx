"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Chip, ChipRow } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { IconUsers } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import type { OpenCandidateDTO } from "@/lib/db/queries";
import type { ProfessionDTO } from "@/lib/db/types";

/**
 * "Ish qidiryapman" belgisini yoqqan nomzodlar.
 * Ariza yuborishni kutmasdan, ish beruvchi o'zi topadi — oqim ikki tomonli.
 */
export function OpenCandidateList({
  candidates,
  professions,
}: {
  candidates: OpenCandidateDTO[];
  professions: ProfessionDTO[];
}) {
  const { t, locale } = useI18n();
  const [profession, setProfession] = useState<string | null>(null);

  const shown = profession
    ? candidates.filter((item) => item.professionId === profession)
    : candidates;

  const seen = (days: number | null) => {
    if (days === null) return "";
    return days === 0
      ? t.trust.seenToday
      : t.trust.seenDays.replace("{count}", String(days));
  };

  return (
    <>
      <NavBar title={t.trust.candidatesTitle} className="sticky top-0 z-20 hairline" />

      <div className="sticky top-11 z-20 bg-surface hairline">
        <ChipRow>
          <Chip selected={profession === null} onClick={() => setProfession(null)}>
            {t.common.all}
          </Chip>
          {professions.map((item) => (
            <Chip
              key={item.id}
              selected={profession === item.id}
              onClick={() => setProfession(item.id)}
            >
              {item.name[locale]}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={44} />}
          title={t.trust.candidatesEmpty}
          hint={t.trust.candidatesHint}
        />
      ) : (
        <ListGroup className="mt-2">
          {shown.map((candidate, i) => (
            <ListItem
              key={candidate.id}
              className="animate-row-in"
              leading={<Avatar name={candidate.name} online />}
              title={candidate.name}
              subtitle={[
                candidate.professionName?.[locale],
                t.job.experience[candidate.experience],
              ]
                .filter(Boolean)
                .join(" · ")}
              caption={[
                candidate.cityName?.[locale],
                t.job.employment[candidate.employment],
              ]
                .filter(Boolean)
                .join(" · ")}
              meta={seen(candidate.lastSeenDays)}
              last={i === shown.length - 1}
            />
          ))}
        </ListGroup>
      )}
    </>
  );
}
