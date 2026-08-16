"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForwardNavigation } from "@/lib/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { PushSettings } from "@/components/profile/push-settings";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconBookmark,
  IconBriefcase,
  IconCamera,
  IconDocument,
  IconCheck,
  IconGlobe,
  IconMic,
  IconMoon,
  IconPencil,
} from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { apiPost } from "@/lib/api";
import { signOut } from "@/lib/sign-out";
import type { CardDTO, CityDTO, ProfessionDTO } from "@/lib/db/types";
import { locales, type Locale } from "@/lib/i18n";
import { useSheet } from "@/lib/use-sheet";
import { cx } from "@/lib/utils";
import shared from "@/styles/shared.module.scss";
import styles from "./profile.module.scss";

export function ProfileScreen({
  card,
  professions,
  cities,
  savedCount,
  applicationCount,
}: {
  card: CardDTO | null;
  professions: ProfessionDTO[];
  cities: CityDTO[];
  savedCount: number;
  applicationCount: number;
}) {
  const { t, locale, setLocale } = useI18n();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const go = useForwardNavigation();
  const languageSheet = useSheet<true>();
  const visibilitySheet = useSheet<true>();

  // Optimistik: tugma darhol o'zgaradi, so'rov fonda ketadi
  const [openToWork, setOpenToWork] = useState(card?.openToWork ?? false);
  const [visibility, setVisibility] = useState<CardDTO["visibility"]>(
    card?.visibility ?? "ish_beruvchilar",
  );

  const toggleOpenToWork = (next: boolean) => {
    setOpenToWork(next);
    void apiPost("/card/open-to-work", { openToWork: next, visibility });
  };

  const chooseVisibility = (next: CardDTO["visibility"]) => {
    setVisibility(next);
    visibilitySheet.close();
    void apiPost("/card/open-to-work", { openToWork, visibility: next });
  };

  const profession = professions.find((item) => item.id === card?.professionId);
  const city = cities.find((item) => item.id === card?.cityId);
  const district = city?.districts.find((item) => item.id === card?.districtId);

  const location = city
    ? district
      ? `${city.name[locale]}, ${district.name[locale]}`
      : city.name[locale]
    : t.screens.profile.notFilled;

  const localeLabels: Record<Locale, string> = {
    uz: t.language.uz,
    "uz-cyrl": t.language.uzCyrl,
    ru: t.language.ru,
  };

  return (
    <Screen title={t.tabs.profile}>
      {/* Kartochka — rezyume o'rniga */}
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={cx(styles.avatar, openToWork && styles.avatarOpen)}>
            <Avatar name={card?.name || "?"} size={64} />
          </span>
          <div className={styles.headText}>
            <h2 className={styles.name}>{card?.name || t.screens.profile.notFilled}</h2>
            <p className={styles.role}>
              {profession ? profession.name[locale] : t.screens.profile.notFilled}
            </p>
          </div>
        </div>

        <div className={shared.tagRow}>
          <Tag>{location}</Tag>
          <Tag>{t.job.experience[card?.experience ?? "none"]}</Tag>
          <Tag>{t.job.employment[card?.employment ?? "full"]}</Tag>
        </div>

        <Button
          block
          variant="secondary"
          className={styles.editButton}
          leading={<IconPencil size={18} />}
          onClick={() => router.push("/card")}
        >
          {t.screens.profile.editCard}
        </Button>
      </div>

      {/* v2 6.1: ariza yuborish bir tomonlama harakat — bu tugma oqimni
          ikki tomonli qiladi va passiv nomzodni ham bozorga olib kiradi */}
      <SectionHeader>{t.trust.openToWork}</SectionHeader>
      <ListGroup>
        <ListItem
          title={<span className={shared.rowTitle}>{t.trust.openToWork}</span>}
          subtitle={openToWork ? t.trust.openToWorkOn : t.trust.openToWorkOff}
          wrapSubtitle
          insetSeparator={false}
          last={!openToWork}
          trailing={
            <Switch
              checked={openToWork}
              onCheckedChange={toggleOpenToWork}
              label={t.trust.openToWork}
            />
          }
        />
        {openToWork && (
          <ListItem
            title={<span className={shared.rowTitle}>{t.trust.visibility}</span>}
            subtitle={visibility === "hamma" ? t.trust.visibilityAll : t.trust.visibilityEmployers}
            insetSeparator={false}
            chevron
            last
            onClick={() => visibilitySheet.open(true)}
          />
        )}
      </ListGroup>
      {openToWork && <p className={shared.hint}>{t.trust.visibilityHint}</p>}

      <SectionHeader>{t.screens.profile.media}</SectionHeader>
      <ListGroup>
        <ListItem
          leading={<IconCamera size={22} className={shared.rowIcon} />}
          title={<span className={shared.rowTitle}>{t.screens.profile.photo}</span>}
          insetSeparator={false}
          chevron
        />
        <ListItem
          leading={<IconMic size={22} className={shared.rowIcon} />}
          title={<span className={shared.rowTitle}>{t.screens.profile.voice}</span>}
          insetSeparator={false}
          chevron
          last
        />
      </ListGroup>
      <p className={shared.hint}>{t.screens.profile.mediaHint}</p>

      <ListGroup className={shared.groupGap}>
        <ListItem
          leading={<IconDocument size={22} className={shared.rowIcon} />}
          title={<span className={shared.rowTitle}>{t.screens.profile.applicationsCount}</span>}
          insetSeparator={false}
          trailing={<span className={shared.rowValue}>{applicationCount}</span>}
          onClick={() => go("/arizalarim")}
          chevron
        />
        {/* v4: "Saqlangan" Ishlar ichidagi filtr edi. Ishlar endi
            kanallar ro'yxati — u yerda filtrga joy yo'q, shuning
            uchun o'z ekrani Profil ichidan ochiladi. */}
        <ListItem
          leading={<IconBookmark size={22} className={shared.rowIcon} />}
          title={<span className={shared.rowTitle}>{t.tabs.saved}</span>}
          insetSeparator={false}
          trailing={<span className={shared.rowValue}>{savedCount}</span>}
          onClick={() => go("/saved")}
          chevron
          last
        />
      </ListGroup>

      {/* v4 §1.5: kuniga bitta yig'ma xabar */}
      <PushSettings />

      <SectionHeader>{t.screens.profile.settings}</SectionHeader>
      <ListGroup>
        <ListItem
          leading={<IconGlobe size={22} className={shared.rowIcon} />}
          title={<span className={shared.rowTitle}>{t.language.label}</span>}
          insetSeparator={false}
          trailing={<span className={shared.rowValue}>{localeLabels[locale]}</span>}
          onClick={() => languageSheet.open(true)}
        />
        <div className={styles.themeRow}>
          <IconMoon size={22} className={shared.rowIcon} />
          <Segmented
            className={styles.themeControl}
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
      </ListGroup>

      <div className={styles.accountActions}>
        <Button
          block
          variant="secondary"
          leading={<IconBriefcase size={18} />}
          onClick={async () => {
            const { next } = await apiPost<{ next: string }>("/auth/role", {
              role: "ish_beruvchi",
            });
            router.push(next);
            router.refresh();
          }}
        >
          {t.employer.switchToEmployer}
        </Button>
        <Button
          block
          variant="danger"
          onClick={async () => {
            await signOut();
            router.replace("/kirish");
            router.refresh();
          }}
        >
          {t.auth.logout}
        </Button>
        <button type="button" onClick={() => router.push("/design")} className={styles.designLink}>
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
              title={<span className={shared.rowTitle}>{localeLabels[value]}</span>}
              insetSeparator={false}
              last={i === locales.length - 1}
              trailing={
                locale === value ? <IconCheck size={20} className={shared.accentIcon} /> : undefined
              }
              onClick={() => {
                setLocale(value);
                languageSheet.close();
              }}
            />
          ))}
        </ListGroup>
        <div className={styles.sheetTail} />
      </Sheet>

      <Sheet
        open={visibilitySheet.isOpen}
        onClose={visibilitySheet.close}
        closeLabel={t.common.close}
        title={t.trust.visibility}
      >
        <ListGroup>
          {(["hamma", "ish_beruvchilar"] as const).map((value, i) => (
            <ListItem
              key={value}
              title={
                <span className={shared.rowTitle}>
                  {value === "hamma" ? t.trust.visibilityAll : t.trust.visibilityEmployers}
                </span>
              }
              insetSeparator={false}
              last={i === 1}
              trailing={
                visibility === value ? (
                  <IconCheck size={20} className={shared.accentIcon} />
                ) : undefined
              }
              onClick={() => chooseVisibility(value)}
            />
          ))}
        </ListGroup>
        <p className={styles.sheetHint}>{t.trust.visibilityHint}</p>
        <div className={styles.sheetTail} />
      </Sheet>
    </Screen>
  );
}
