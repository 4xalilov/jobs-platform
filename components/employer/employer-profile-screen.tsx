"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconBolt,
  IconCheck,
  IconGlobe,
  IconMoon,
  IconShieldCheck,
  IconUser,
} from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { apiPost } from "@/lib/api";
import type { CompanyDTO } from "@/lib/db/types";
import { locales, type Locale } from "@/lib/i18n";
import { useSheet } from "@/lib/use-sheet";

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
    <>
      <NavBar title={t.employer.tabs.profile} className="sticky top-0 z-20 hairline" />

      <div className="bg-surface px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <Avatar name={company.name} size={64} online={company.fastReply} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[20px] leading-6 font-semibold text-text">
              {company.name}
            </h2>
            {company.phone && (
              <p className="mt-0.5 truncate text-body text-text-secondary">{company.phone}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
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

        {company.about && <p className="mt-3 text-body text-text">{company.about}</p>}
      </div>

      <ListGroup className="mt-5">
        <ListItem
          title={
            <span className="text-body font-normal">{t.employer.company.activeVacancies}</span>
          }
          insetSeparator={false}
          trailing={<span className="text-body text-text-secondary">{activeCount}</span>}
        />
        <ListItem
          title={
            <span className="text-body font-normal">{t.employer.company.totalApplications}</span>
          }
          insetSeparator={false}
          trailing={<span className="text-body text-text-secondary">{totalApplications}</span>}
          last
        />
      </ListGroup>

      <p className="px-4 pt-2 text-caption text-text-tertiary">
        {t.employer.company.fastReplyHint}
      </p>

      <SectionHeader>{t.screens.profile.settings}</SectionHeader>
      <ListGroup>
        <ListItem
          leading={<IconGlobe size={22} className="text-text-secondary" />}
          title={<span className="text-body font-normal">{t.language.label}</span>}
          insetSeparator={false}
          trailing={<span className="text-body text-text-secondary">{localeLabels[locale]}</span>}
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
        <Button
          block
          variant="secondary"
          leading={<IconUser size={18} />}
          onClick={async () => {
            const { next } = await apiPost<{ next: string }>("/auth/role", { role: "nomzod" });
            router.push(next);
            router.refresh();
          }}
        >
          {t.employer.switchToSeeker}
        </Button>
        <Button
          block
          variant="danger"
          className="mt-2"
          onClick={async () => {
            await apiPost("/auth/logout");
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
