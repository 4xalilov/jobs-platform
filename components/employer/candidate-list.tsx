"use client";

import { useRouter } from "next/navigation";
import { useSystemMessageText } from "@/components/chat/chat-list";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconMessage, IconUsers } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Sheet } from "@/components/ui/sheet";
import type { CandidateDTO } from "@/lib/db/types";
import { useSheet } from "@/lib/use-sheet";
import { formatSalary } from "@/lib/utils";

/** Nomzodlar — arizalar chat ro'yxati sifatida */
export function CandidateList({ candidates }: { candidates: CandidateDTO[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const card = useSheet<CandidateDTO>();
  const systemText = useSystemMessageText();

  const location = (candidate: CandidateDTO) => {
    const city = candidate.cityName?.[locale] ?? "";
    const district = candidate.districtName?.[locale];
    return district ? `${city}, ${district}` : city;
  };

  return (
    <>
      <NavBar title={t.employer.candidates.title} className="sticky top-0 z-20 hairline" />

      {candidates.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={44} />}
          title={t.employer.candidates.empty}
          hint={t.employer.candidates.emptyHint}
        />
      ) : (
        <ListGroup>
          {candidates.map((candidate, i) => (
            <ListItem
              key={candidate.chatId}
              leading={<Avatar name={candidate.name} />}
              title={candidate.name}
              subtitle={systemText(candidate.lastMessage)}
              caption={`${candidate.professionName?.[locale] ?? ""} · ${t.job.experience[candidate.experience]}`}
              meta={candidate.lastMessageAt}
              trailing={<CountBadge count={candidate.unread} />}
              last={i === candidates.length - 1}
              onClick={() => card.open(candidate)}
            />
          ))}
        </ListGroup>
      )}

      {/* Avval kartochkani ko'radi, keyin chatni ochadi */}
      <Sheet
        open={card.isOpen}
        onClose={card.close}
        closeLabel={t.common.close}
        footer={
          <Button
            block
            size="lg"
            leading={<IconMessage size={20} />}
            onClick={() => {
              if (card.value) router.push(`/employer/chat/${card.value.chatId}`);
            }}
          >
            {t.employer.candidates.openChat}
          </Button>
        }
      >
        {card.value && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar name={card.value.name} size={56} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[20px] leading-6 font-semibold text-text">
                  {card.value.name}
                </h2>
                <p className="mt-0.5 truncate text-body text-text-secondary">
                  {card.value.professionName?.[locale] ?? ""}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>{location(card.value)}</Tag>
              <Tag>{t.job.experience[card.value.experience]}</Tag>
            </div>

            <p className="mt-4 text-caption text-text-secondary">{t.employer.candidates.expects}</p>
            <p className="text-title text-text">
              {formatSalary(
                card.value.salaryMin,
                card.value.salaryMax,
                t.job.currency,
                t.job.negotiable,
              )}
            </p>

            <p className="mt-3 text-caption text-text-secondary">
              {t.employer.candidates.appliedTo}
            </p>
            <p className="text-body text-text">{card.value.vacancyTitle}</p>
          </div>
        )}
      </Sheet>
    </>
  );
}
