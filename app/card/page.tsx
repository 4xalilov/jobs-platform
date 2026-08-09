"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { SelectField, TextField } from "@/components/ui/field";
import { IconArrowLeft, IconCamera, IconCheck, IconMic, IconVideo } from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import {
  cities,
  cityById,
  professions,
  salaryRanges,
  type CandidateCard,
  type ExperienceLevel,
} from "@/lib/mock-data";
import { useCard } from "@/lib/stores";
import { useSheet } from "@/lib/use-sheet";
import { formatSalary } from "@/lib/utils";

type Picker = "profession" | "city" | "district" | "salary";

/** Rezyume o'rniga kartochka — 5 maydon, bo'ldi */
export default function CardPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { card, save } = useCard();

  const [draft, setDraft] = useState<CandidateCard>(card);
  const picker = useSheet<Picker>();

  const patch = (changes: Partial<CandidateCard>) =>
    setDraft((previous) => ({ ...previous, ...changes }));

  const profession = draft.professionId
    ? professions.find((p) => p.id === draft.professionId)
    : undefined;
  const city = draft.cityId ? cityById(draft.cityId) : undefined;
  const district =
    city && draft.districtIndex !== null ? city.districts[draft.districtIndex] : undefined;

  const experienceOptions: { value: ExperienceLevel; label: string }[] = [
    { value: "none", label: t.job.experience.none },
    { value: "upToOne", label: t.job.experience.upToOne },
    { value: "oneToThree", label: t.job.experience.oneToThree },
    { value: "threePlus", label: t.job.experience.threePlus },
  ];

  const commit = () => {
    save(draft);
    router.back();
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[440px] bg-bg pb-10">
      <NavBar
        className="sticky top-0 z-20 hairline"
        title={t.screens.card.title}
        leading={
          <button
            type="button"
            aria-label={t.common.back}
            onClick={() => router.back()}
            className="p-2 text-accent"
          >
            <IconArrowLeft size={24} />
          </button>
        }
        trailing={
          <button type="button" onClick={commit} className="px-2 text-body font-medium text-accent">
            {t.common.save}
          </button>
        }
      />

      <ListGroup className="mt-3">
        <div className="relative hairline hairline-inset-sm">
          <TextField
            value={draft.name}
            onValueChange={(name) => patch({ name })}
            placeholder={t.screens.card.namePlaceholder}
          />
        </div>

        <SelectField
          label={t.screens.card.profession}
          value={profession ? profession.name[locale] : null}
          placeholder={t.screens.card.chooseProfession}
          onClick={() => picker.open("profession")}
        />

        <SelectField
          label={t.screens.card.city}
          value={city ? city.name[locale] : null}
          placeholder={t.screens.card.chooseCity}
          onClick={() => picker.open("city")}
        />

        {city && city.districts.length > 0 && (
          <SelectField
            label={t.screens.card.district}
            value={district ? district[locale] : null}
            placeholder={t.screens.card.chooseCity}
            onClick={() => picker.open("district")}
          />
        )}

        <SelectField
          label={t.screens.card.salary}
          value={
            draft.salaryMin || draft.salaryMax
              ? formatSalary(draft.salaryMin, draft.salaryMax, t.job.currency, t.screens.card.salaryAny)
              : null
          }
          placeholder={t.screens.card.chooseSalary}
          onClick={() => picker.open("salary")}
          last
        />
      </ListGroup>

      <SectionHeader>{t.screens.card.experience}</SectionHeader>
      <div className="bg-surface px-4 py-3">
        <Segmented
          label={t.screens.card.experience}
          options={experienceOptions}
          value={draft.experience}
          onChange={(experience) => patch({ experience })}
        />
      </div>

      <SectionHeader>{t.screens.profile.media}</SectionHeader>
      <ListGroup>
        <ListItem
          leading={<IconCamera size={22} className="text-text-secondary" />}
          title={<span className="text-body font-normal">{t.screens.profile.photo}</span>}
          insetSeparator={false}
          chevron
        />
        <ListItem
          leading={<IconVideo size={22} className="text-text-secondary" />}
          title={<span className="text-body font-normal">{t.screens.profile.video}</span>}
          insetSeparator={false}
          chevron
        />
        <ListItem
          leading={<IconMic size={22} className="text-text-secondary" />}
          title={<span className="text-body font-normal">{t.screens.profile.voice}</span>}
          insetSeparator={false}
          chevron
          last
        />
      </ListGroup>

      <p className="px-4 pt-2 text-caption text-text-tertiary">{t.screens.card.hint}</p>

      <Sheet
        open={picker.isOpen}
        onClose={picker.close}
        closeLabel={t.common.close}
        title={
          picker.value === "profession"
            ? t.screens.card.profession
            : picker.value === "city"
              ? t.screens.card.city
              : picker.value === "district"
                ? t.screens.card.district
                : t.screens.card.salary
        }
      >
        <ListGroup>
          {picker.value === "profession" &&
            professions.map((option, i) => (
              <PickerRow
                key={option.id}
                label={option.name[locale]}
                selected={draft.professionId === option.id}
                last={i === professions.length - 1}
                onSelect={() => {
                  patch({ professionId: option.id });
                  picker.close();
                }}
              />
            ))}

          {picker.value === "city" &&
            cities.map((option, i) => (
              <PickerRow
                key={option.id}
                label={option.name[locale]}
                selected={draft.cityId === option.id}
                last={i === cities.length - 1}
                onSelect={() => {
                  patch({
                    cityId: option.id,
                    districtIndex: option.districts.length > 0 ? 0 : null,
                  });
                  picker.close();
                }}
              />
            ))}

          {picker.value === "district" &&
            city?.districts.map((option, i) => (
              <PickerRow
                key={option.uz}
                label={option[locale]}
                selected={draft.districtIndex === i}
                last={i === city.districts.length - 1}
                onSelect={() => {
                  patch({ districtIndex: i });
                  picker.close();
                }}
              />
            ))}

          {picker.value === "salary" &&
            salaryRanges.map((range, i) => (
              <PickerRow
                key={i}
                label={formatSalary(range.min, range.max, t.job.currency, t.screens.card.salaryAny)}
                selected={draft.salaryMin === range.min && draft.salaryMax === range.max}
                last={i === salaryRanges.length - 1}
                onSelect={() => {
                  patch({ salaryMin: range.min, salaryMax: range.max });
                  picker.close();
                }}
              />
            ))}
        </ListGroup>
        <div className="h-4" />
      </Sheet>
    </div>
  );
}

function PickerRow({
  label,
  selected,
  last,
  onSelect,
}: {
  label: string;
  selected: boolean;
  last: boolean;
  onSelect: () => void;
}) {
  return (
    <ListItem
      title={<span className="text-body font-normal">{label}</span>}
      insetSeparator={false}
      last={last}
      trailing={selected ? <IconCheck size={20} className="text-accent" /> : undefined}
      onClick={onSelect}
      className="py-3"
    />
  );
}
