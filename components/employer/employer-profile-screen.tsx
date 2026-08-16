"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCard,
  IconBolt,
  IconCheck,
  IconGlobe,
  IconMoon,
  IconShieldCheck,
  IconUser,
} from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { apiPost } from "@/lib/api";
import { signOut } from "@/lib/sign-out";
import type { CompanyDTO } from "@/lib/db/types";
import { locales, type Locale } from "@/lib/i18n";
import { useSheet } from "@/lib/use-sheet";
import shared from "@/styles/shared.module.scss";
import styles from "./employer.module.scss";

export function EmployerProfileScreen({
  company,
  activeCount,
  totalApplications,
}: {
  company: CompanyDTO;
  activeCount: number;
  totalApplications: number;
}) {
  const { t, locale, setLocale } = useI18n();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const languageSheet = useSheet<true>();

  const localeLabels: Record<Locale, string> = {
    uz: t.language.uz,
    "uz-cyrl": t.language.uzCyrl,
    ru: t.language.ru,
  };

  return (
    <Screen title={t.employer.tabs.profile}>
      <div className={styles.companyCard}>
        <div className={styles.companyHead}>
          <Avatar name={company.name} size={64} online={company.fastReply} />
          <div className={styles.companyHeadText}>
            <h2 className={shared.sheetTitle}>{company.name}</h2>
            {company.phone && <p className={styles.companyPhone}>{company.phone}</p>}
          </div>
        </div>

        <div className={shared.tagRow}>
          {company.verified && (
            <Tag tone="accent" icon={<IconShieldCheck size={13} />}>
              {t.employer.company.verified}
            </Tag>
          )}
          {company.fastReply && (
            <Tag tone="success" icon={<IconBolt size={13} />}>
              {t.job.fastReply}
            </Tag>
          )}
        </div>

        {company.about && <p className={styles.companyAbout}>{company.about}</p>}
      </div>

      <ListGroup className={shared.groupGap}>
        <ListItem
          title={<span className={shared.rowTitle}>{t.employer.company.activeVacancies}</span>}
          insetSeparator={false}
          trailing={<span className={shared.rowValue}>{activeCount}</span>}
        />
        <ListItem
          title={<span className={shared.rowTitle}>{t.employer.company.totalApplications}</span>}
          insetSeparator={false}
          trailing={<span className={shared.rowValue}>{totalApplications}</span>}
          last
        />
      </ListGroup>

      <p className={shared.hint}>{t.employer.company.fastReplyHint}</p>

      {/* Tariflar tab bardan chiqdi — o'rniga nomzod qidiruvi keldi.
          Sahifaning o'zi shu yerdan ochiladi. */}
      <ListGroup className={shared.groupGap}>
        <ListItem
          leading={<IconCard size={22} className={shared.rowIcon} />}
          title={<span className={shared.rowTitle}>{t.employer.tabs.plans}</span>}
          insetSeparator={false}
          chevron
          last
          onClick={() => router.push("/employer/plans")}
        />
      </ListGroup>

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
          leading={<IconUser size={18} />}
          onClick={async () => {
            const { next } = await apiPost<{ next: string }>("/auth/role", {
              role: "nomzod",
            });
            router.push(next);
            router.refresh();
          }}
        >
          {t.employer.switchToSeeker}
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
    </Screen>
  );
}
