"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { SelectField, TextField } from "@/components/ui/field";
import { IconArrowLeft, IconCamera, IconCheck, IconMic } from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { apiPut } from "@/lib/api";
import type {
  CardDTO,
  CityDTO,
  EmploymentType,
  ExperienceLevel,
  ProfessionDTO,
} from "@/lib/db/types";
import { useSheet } from "@/lib/use-sheet";

type Picker = "profession" | "city" | "district" | "employment";

const EMPLOYMENT_TYPES: EmploymentType[] = ["full", "part", "shift", "temporary"];

/** Rezyume o'rniga kartochka — 5 maydon, bo'ldi */
export function CardEditor({
  card,
  professions,
  cities,
}: {
  card: CardDTO;
  professions: ProfessionDTO[];
  cities: CityDTO[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [draft, setDraft] = useState(card);
  const [saving, setSaving] = useState(false);
  const picker = useSheet<Picker>();

  const patch = (changes: Partial<CardDTO>) =>
    setDraft((previous) => ({ ...previous, ...changes }));

  const profession = professions.find((item) => item.id === draft.professionId);
  const city = cities.find((item) => item.id === draft.cityId);
  const district = city?.districts.find((item) => item.id === draft.districtId);

  const experienceOptions: { value: ExperienceLevel; label: string }[] = [
    { value: "none", label: t.job.experience.none },
    { value: "upToOne", label: t.job.experience.upToOne },
    { value: "oneToThree", label: t.job.experience.oneToThree },
    { value: "threePlus", label: t.job.experience.threePlus },
  ];

  const commit = async () => {
    setSaving(true);
    await apiPut("/card", draft);
    router.push("/profile");
    router.refresh();
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
          <button
            type="button"
            onClick={commit}
            disabled={saving || !draft.name.trim()}
            className="px-2 text-body font-medium text-accent disabled:opacity-40"
          >
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
            value={district ? district.name[locale] : null}
            placeholder={t.screens.card.chooseCity}
            onClick={() => picker.open("district")}
          />
        )}

        {/* v2 ning 5-maydoni: kutilayotgan maosh o'rniga ish turi */}
        <SelectField
          label={t.screens.card.employment}
          value={t.job.employment[draft.employment]}
          placeholder={t.screens.card.chooseEmployment}
          onClick={() => picker.open("employment")}
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
                : t.screens.card.employment
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
                    districtId: option.districts[0]?.id ?? null,
                  });
                  picker.close();
                }}
              />
            ))}

          {picker.value === "district" &&
            city?.districts.map((option, i) => (
              <PickerRow
                key={option.id}
                label={option.name[locale]}
                selected={draft.districtId === option.id}
                last={i === city.districts.length - 1}
                onSelect={() => {
                  patch({ districtId: option.id });
                  picker.close();
                }}
              />
            ))}

          {picker.value === "employment" &&
            EMPLOYMENT_TYPES.map((option, i) => (
              <PickerRow
                key={option}
                label={t.job.employment[option]}
                selected={draft.employment === option}
                last={i === EMPLOYMENT_TYPES.length - 1}
                onSelect={() => {
                  patch({ employment: option });
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
