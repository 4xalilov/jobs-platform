"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconMessage, IconUsers } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Sheet } from "@/components/ui/sheet";
import {
  candidates,
  cityById,
  employerVacancyById,
  professionById,
  type Candidate,
} from "@/lib/mock-data";
import { useSheet } from "@/lib/use-sheet";
import { formatSalary } from "@/lib/utils";

/** Nomzodlar — arizalar chat ro'yxati sifatida */
export default function CandidatesPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const card = useSheet<Candidate>();

  const location = (candidate: Candidate) => {
    const city = cityById(candidate.cityId);
    if (!city) return "";
    const district =
      candidate.districtIndex !== null ? city.districts[candidate.districtIndex] : undefined;
    return district ? `${city.name[locale]}, ${district[locale]}` : city.name[locale];
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
          {candidates.map((candidate, i) => {
            const profession = professionById(candidate.professionId);
            const lastMessage = candidate.messages[candidate.messages.length - 1];
            return (
              <ListItem
                key={candidate.id}
                leading={<Avatar name={candidate.name} />}
                title={candidate.name}
                subtitle={lastMessage.text[locale]}
                caption={`${profession ? profession.name[locale] : ""} · ${t.job.experience[candidate.experience]}`}
                meta={candidate.time}
                trailing={<CountBadge count={candidate.unread} />}
                last={i === candidates.length - 1}
                onClick={() => card.open(candidate)}
              />
            );
          })}
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
            // Sheet sahifa almashganda o'zi yo'qoladi — bu yerda close() chaqirilsa,
            // history.back() endigina qo'shilgan yo'nalishni bekor qiladi
            onClick={() => {
              if (card.value) router.push(`/employer/chat/${card.value.id}`);
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
                  {professionById(card.value.professionId)?.name[locale] ?? ""}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>{location(card.value)}</Tag>
              <Tag>{t.job.experience[card.value.experience]}</Tag>
            </div>

            <p className="mt-4 text-caption text-text-secondary">
              {t.employer.candidates.expects}
            </p>
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
            <p className="text-body text-text">
              {(() => {
                const vacancy = employerVacancyById(card.value.vacancyId);
                const profession = vacancy ? professionById(vacancy.professionId) : undefined;
                return profession ? profession.name[locale] : "";
              })()}
            </p>
          </div>
        )}
      </Sheet>
    </>
  );
}
