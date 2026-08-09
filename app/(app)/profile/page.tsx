"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCamera,
  IconCheck,
  IconGlobe,
  IconMic,
  IconMoon,
  IconPencil,
  IconVideo,
} from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { cityById, professionById } from "@/lib/mock-data";
import { useApplied, useCard, useSaved } from "@/lib/stores";
import { locales, type Locale } from "@/lib/i18n";
import { useSheet } from "@/lib/use-sheet";
import { formatSalary } from "@/lib/utils";

export default function ProfilePage() {
  const { t, locale, setLocale } = useI18n();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const { card } = useCard();
  const { ids: appliedIds } = useApplied();
  const { ids: savedIds } = useSaved();
  const languageSheet = useSheet<true>();

  const profession = card.professionId ? professionById(card.professionId) : undefined;
  const city = card.cityId ? cityById(card.cityId) : undefined;
  const district =
    city && card.districtIndex !== null ? city.districts[card.districtIndex] : undefined;

  const location = city
    ? district
      ? `${city.name[locale]}, ${district[locale]}`
      : city.name[locale]
    : t.screens.profile.notFilled;

  const localeLabels: Record<Locale, string> = {
    uz: t.language.uz,
    "uz-cyrl": t.language.uzCyrl,
    ru: t.language.ru,
  };

  return (
    <>
      <NavBar title={t.tabs.profile} className="sticky top-0 z-20 hairline" />

      {/* Kartochka — rezyume o'rniga */}
      <div className="bg-surface px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <Avatar name={card.name || "?"} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[20px] leading-6 font-semibold text-text">
              {card.name || t.screens.profile.notFilled}
            </h2>
            <p className="mt-0.5 truncate text-body text-text-secondary">
              {profession ? profession.name[locale] : t.screens.profile.notFilled}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>{location}</Tag>
          <Tag>{t.job.experience[card.experience]}</Tag>
          <Tag>
            {formatSalary(card.salaryMin, card.salaryMax, t.job.currency, t.screens.card.salaryAny)}
          </Tag>
        </div>

        <Button
          block
          variant="secondary"
          className="mt-4"
          leading={<IconPencil size={18} />}
          onClick={() => router.push("/card")}
        >
          {t.screens.profile.editCard}
        </Button>
      </div>

      {/* Qo'shimcha — majburiy emas */}
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
      <p className="px-4 pt-2 text-caption text-text-tertiary">{t.screens.profile.mediaHint}</p>

      {/* Statistika */}
      <ListGroup className="mt-5">
        <ListItem
          title={<span className="text-body font-normal">{t.screens.profile.applicationsCount}</span>}
          insetSeparator={false}
          trailing={<span className="text-body text-text-secondary">{appliedIds.length}</span>}
        />
        <ListItem
          title={<span className="text-body font-normal">{t.screens.profile.savedCount}</span>}
          insetSeparator={false}
          trailing={<span className="text-body text-text-secondary">{savedIds.length}</span>}
          last
        />
      </ListGroup>

      {/* Sozlamalar */}
      <SectionHeader>{t.screens.profile.settings}</SectionHeader>
      <ListGroup>
        <ListItem
          leading={<IconGlobe size={22} className="text-text-secondary" />}
          title={<span className="text-body font-normal">{t.language.label}</span>}
          insetSeparator={false}
          trailing={
            <span className="text-body text-text-secondary">{localeLabels[locale]}</span>
          }
          onClick={() => languageSheet.open(true)}
        />
        <div className="bg-surface px-4 py-3">
          <div className="flex items-center gap-3">
            <IconMoon size={22} className="shrink-0 text-text-secondary" />
            <Segmented
              className="flex-1"
              label={t.theme.label}
              options={[
                { value: "light" as const, label: t.theme.light },
                { value: "dark" as const, label: t.theme.dark },
                { value: "system" as const, label: t.theme.system },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>
        </div>
      </ListGroup>

      <div className="px-4 py-6">
        <button
          type="button"
          onClick={() => router.push("/design")}
          className="text-caption text-text-tertiary underline"
        >
          {t.design.title}
        </button>
      </div>

      <Sheet
        open={languageSheet.isOpen}
        onClose={languageSheet.close}
        closeLabel={t.common.close}
        title={t.language.label}
      >
        <ListGroup>
          {locales.map((value, i) => (
            <ListItem
              key={value}
              title={<span className="text-body font-normal">{localeLabels[value]}</span>}
              insetSeparator={false}
              last={i === locales.length - 1}
              trailing={
                locale === value ? <IconCheck size={20} className="text-accent" /> : undefined
              }
              onClick={() => {
                setLocale(value);
                languageSheet.close();
              }}
              className="py-3"
            />
          ))}
        </ListGroup>
        <div className="h-4" />
      </Sheet>
    </>
  );
}
