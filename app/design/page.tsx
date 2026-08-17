"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTheme, type ThemeMode } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge, Dot, Tag } from "@/components/ui/badge";
import { Button, Fab } from "@/components/ui/button";
import { Chip, ChipRow } from "@/components/ui/chip";
import { FieldRow, SelectField, TextField } from "@/components/ui/field";
import {
  IconBolt,
  IconBookmark,
  IconBriefcase,
  IconCamera,
  IconCard,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconEye,
  IconGlobe,
  IconMapPin,
  IconMessage,
  IconMic,
  IconMoon,
  IconNearby,
  IconPencil,
  IconPhone,
  IconPlay,
  IconPlus,
  IconSearch,
  IconSend,
  IconShieldCheck,
  IconSliders,
  IconStar,
  IconSun,
  IconTrash,
  IconUser,
  IconUsers,
  IconVideo,
  IconX,
} from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { SearchField } from "@/components/ui/search-field";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { ListSkeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { SwipeListItem } from "@/components/ui/swipe-list-item";
import { TabBar, type TabKey } from "@/components/ui/tab-bar";
import { locales, type Locale } from "@/lib/i18n";
import {
  sampleChats,
  sampleProfessions,
  sampleSearches,
  sampleVacancies,
} from "@/lib/design-samples";
import { cx, formatAgo, formatSalary } from "@/lib/utils";
import { ScaleLab } from "@/components/design/scale-lab";
import { TokenLab } from "@/components/design/token-lab";
import shared from "@/styles/shared.module.scss";
import styles from "./design.module.scss";

type ExperienceLevel = "none" | "upToOne" | "oneToThree" | "threePlus";

export default function DesignSystemPage() {
  const { t, locale, setLocale } = useI18n();
  const { mode, setMode, resolved } = useTheme();

  const [profession, setProfession] = useState<string | null>(null);
  const [motionKey, setMotionKey] = useState(0);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [professionSheetOpen, setProfessionSheetOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel>("none");
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("jobs");
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "light", label: t.theme.light },
    { value: "dark", label: t.theme.dark },
    { value: "system", label: t.theme.system },
  ];

  const localeLabels: Record<Locale, string> = {
    uz: t.language.uz,
    "uz-cyrl": t.language.uzCyrl,
    ru: t.language.ru,
  };

  const experienceOptions: { value: ExperienceLevel; label: string }[] = [
    { value: "none", label: t.job.experience.none },
    { value: "upToOne", label: t.job.experience.upToOne },
    { value: "oneToThree", label: t.job.experience.oneToThree },
    { value: "threePlus", label: t.job.experience.threePlus },
  ];

  const toggleSaved = (id: string) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className={styles.page}>
      {/* ——— Sarlavha va boshqaruvlar ——— */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t.design.title}</h1>
        <p className={styles.subtitle}>{t.design.subtitle}</p>

        <div className={styles.controls}>
          <Segmented options={themeOptions} value={mode} onChange={setMode} label={t.theme.label} />
          <Segmented
            options={locales.map((l) => ({ value: l, label: localeLabels[l] }))}
            value={locale}
            onChange={setLocale}
            label={t.language.label}
          />
        </div>
      </div>

      {/* ——— 1. Ranglar ——— */}
      <SectionHeader>{t.design.sections.colors}</SectionHeader>
      <TokenLab theme={resolved} />
      <p className={styles.note}>{t.design.colors.note}</p>

      {/* ——— Shkalalar: bo'shliq, radius, tipografika ——— */}
      <SectionHeader>Shkalalar</SectionHeader>
      <ScaleLab />

      {/* ——— 2. Tipografika ——— */}
      <SectionHeader>{t.design.sections.typography}</SectionHeader>
      <div className={styles.stack}>
        <TypeSample spec={t.design.typography.largeSpec}>
          <span className={styles.large}>{t.tabs.jobs}</span>
        </TypeSample>
        <TypeSample spec={t.design.typography.navSpec}>
          <span className={styles.nav}>{t.design.typography.titleSample}</span>
        </TypeSample>
        <TypeSample spec={t.design.typography.titleSpec}>
          <span className={styles.titleSample}>{t.design.typography.titleSample}</span>
        </TypeSample>
        <TypeSample spec={t.design.typography.bodySpec}>
          <span className={styles.body}>{t.design.typography.bodySample}</span>
        </TypeSample>
        <TypeSample spec={t.design.typography.captionSpec}>
          <span className={styles.caption}>{t.design.typography.captionSample}</span>
        </TypeSample>
        <TypeSample spec={t.design.typography.sectionSpec}>
          <span className={styles.section}>{t.design.sections.typography}</span>
        </TypeSample>
        <p className={styles.noteInline}>{t.design.typography.fontNote}</p>
      </div>

      {/* ——— 3. Tugmalar ——— */}
      <SectionHeader>{t.design.sections.buttons}</SectionHeader>
      <div className={styles.stack}>
        <div className={styles.row}>
          <Button variant="primary">{t.design.buttons.primary}</Button>
          <Button variant="secondary">{t.design.buttons.secondary}</Button>
          <Button variant="ghost">{t.design.buttons.ghost}</Button>
          <Button variant="danger" leading={<IconTrash size={18} />}>
            {t.design.buttons.danger}
          </Button>
        </div>
        <div className={styles.row}>
          <Button size="sm" variant="secondary">
            sm
          </Button>
          <Button size="md" variant="secondary">
            md
          </Button>
          <Button size="lg" variant="secondary">
            lg
          </Button>
          <Button variant="secondary" disabled>
            {t.design.buttons.disabled}
          </Button>
          <Button variant="secondary" loading>
            {t.design.buttons.loading}
          </Button>
        </div>
        {/* Optimistic UI — tap darhol javob beradi */}
        <Button
          size="lg"
          block
          variant={applied ? "secondary" : "primary"}
          leading={applied ? <IconCheck size={20} /> : undefined}
          onClick={() => setApplied((v) => !v)}
        >
          {applied ? t.common.applied : t.common.apply}
        </Button>
      </div>

      {/* ——— 4. Ro'yxat elementi ——— */}
      <SectionHeader>{t.design.sections.listItem}</SectionHeader>
      <ListGroup>
        {sampleVacancies.map((vacancy, i) => (
          <ListItem
            key={vacancy.id}
            leading={<Avatar name={vacancy.company} online={vacancy.fastReply} />}
            title={vacancy.title[locale]}
            titleAdornment={
              vacancy.verified ? (
                <IconShieldCheck size={15} className={styles.accentIcon} />
              ) : undefined
            }
            subtitle={formatSalary(
              vacancy.salaryMin,
              vacancy.salaryMax,
              t.job.currency,
              t.job.negotiable,
            )}
            caption={`${vacancy.company} · ${vacancy.location[locale]}`}
            meta={formatAgo(vacancy.postedMinutesAgo, t.time)}
            trailing={vacancy.fastReply ? <Dot className={styles.successDot} /> : undefined}
            last={i === sampleVacancies.length - 1}
            onClick={() => setSheetOpen(true)}
          />
        ))}
      </ListGroup>
      <p className={styles.note}>{t.design.listItem.note}</p>

      {/* Xabarlar ro'yxati — aynan Telegram ko'rinishi */}
      <SectionHeader>{t.tabs.messages}</SectionHeader>
      <ListGroup>
        {sampleChats.map((chat, i) => (
          <ListItem
            key={chat.id}
            leading={<Avatar name={chat.company} />}
            title={chat.company}
            subtitle={chat.message[locale]}
            meta={chat.time}
            trailing={<CountBadge count={chat.unread} />}
            last={i === sampleChats.length - 1}
            onClick={() => undefined}
          />
        ))}
      </ListGroup>

      {/* ——— 5. Kasb filtri ——— */}
      <SectionHeader>{t.design.sections.chips}</SectionHeader>
      <div className={cx(styles.surface, styles.padY)}>
        <ChipRow>
          <Chip selected={profession === null} onClick={() => setProfession(null)}>
            {t.common.all}
          </Chip>
          {sampleProfessions.map((p) => (
            <Chip key={p.id} selected={profession === p.id} onClick={() => setProfession(p.id)}>
              {p.name[locale]}
            </Chip>
          ))}
        </ChipRow>
      </div>
      <p className={styles.note}>{t.design.chips.note}</p>

      {/* ——— 6. Qidiruv ——— */}
      <SectionHeader>{t.design.sections.search}</SectionHeader>
      <div className={cx(styles.surface, styles.padTop)}>
        <SearchField
          value={query}
          onValueChange={setQuery}
          placeholder={t.design.search.placeholder}
          clearLabel={t.common.close}
        />
      </div>
      <SectionHeader>{t.design.search.recent}</SectionHeader>
      <ListGroup>
        {sampleSearches.map((item, i) => (
          <ListItem
            key={item.uz}
            leading={<IconClock size={20} className={styles.mutedIcon} />}
            title={<span className={styles.body}>{item[locale]}</span>}
            insetSeparator={false}
            last={i === sampleSearches.length - 1}
            onClick={() => setQuery(item[locale])}
          />
        ))}
      </ListGroup>
      <p className={styles.note}>{t.design.search.note}</p>

      {/* ——— 7. Avatar va belgilar ——— */}
      <SectionHeader>{t.design.sections.avatars}</SectionHeader>
      <div className={styles.stack}>
        <div className={styles.avatarRow}>
          <Avatar name="Chorsu Market" size={56} online />
          <Avatar name="Milano Cafe" size={48} />
          <Avatar name="Express Yetkazib" size={40} />
          <Avatar name="Korzinka" size={32} />
        </div>
        <div className={styles.badgeRow}>
          <Tag tone="success" icon={<IconBolt size={13} />}>
            {t.design.avatars.badgeFast}
          </Tag>
          <Tag tone="accent" icon={<IconShieldCheck size={13} />}>
            {t.design.avatars.badgeVerified}
          </Tag>
          <Tag tone="warning">{t.design.avatars.badgeNew}</Tag>
          <Tag tone="neutral" icon={<IconNearby size={13} />}>
            {t.job.nearby}
          </Tag>
          <CountBadge count={3} />
          <CountBadge count={128} tone="neutral" />
          <Dot />
        </div>
        <p className={styles.noteInline}>{t.design.avatars.note}</p>
      </div>

      {/* ——— 8. Sheet ——— */}
      <SectionHeader>{t.design.sections.sheet}</SectionHeader>
      <div className={styles.stack}>
        <Button block size="lg" variant="secondary" onClick={() => setSheetOpen(true)}>
          {t.design.sheet.open}
        </Button>
        <p className={styles.noteInline}>{t.design.sheet.note}</p>
      </div>

      {/* ——— 9. Skelet ——— */}
      <SectionHeader
        action={
          <button
            type="button"
            onClick={() => setShowSkeleton((v) => !v)}
            className={styles.toggle}
          >
            {showSkeleton ? t.common.done : t.design.skeleton.toggle}
          </button>
        }
      >
        {t.design.sections.skeleton}
      </SectionHeader>
      {showSkeleton ? (
        <ListGroup>
          <ListSkeleton rows={3} />
        </ListGroup>
      ) : (
        <ListGroup>
          {sampleVacancies.slice(0, 3).map((vacancy, i) => (
            <ListItem
              key={vacancy.id}
              leading={<Avatar name={vacancy.company} />}
              title={vacancy.title[locale]}
              subtitle={formatSalary(
                vacancy.salaryMin,
                vacancy.salaryMax,
                t.job.currency,
                t.job.negotiable,
              )}
              meta={formatAgo(vacancy.postedMinutesAgo, t.time)}
              last={i === 2}
            />
          ))}
        </ListGroup>
      )}
      <p className={styles.note}>{t.design.skeleton.note}</p>

      {/* ——— 10. Forma elementlari ——— */}
      <SectionHeader>{t.design.sections.forms}</SectionHeader>
      <div className={styles.surface}>
        <div className={styles.formsHead}>
          <p className={styles.caption}>
            {t.design.forms.stepLabel} 2 {t.design.forms.stepOf} 4
          </p>
          <div className={styles.progressTrack}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cx(styles.progressStep, i <= 1 && styles.progressStepDone)}
              />
            ))}
          </div>
        </div>
        <div className={cx(styles.nameField, "hairline", "hairline-inset-sm")}>
          <TextField
            value={name}
            onValueChange={setName}
            placeholder={t.design.forms.inputPlaceholder}
          />
        </div>
        <SelectField
          label={t.design.forms.selectLabel}
          value={
            selectedProfession
              ? sampleProfessions.find((item) => item.id === selectedProfession)?.name[locale]
              : null
          }
          placeholder={t.design.forms.selectPlaceholder}
          onClick={() => setProfessionSheetOpen(true)}
        />
        <FieldRow
          label={t.design.forms.switchLabel}
          hint={mode === "system" ? t.design.forms.switchHint : undefined}
          control={
            <Switch
              checked={resolved === "dark"}
              onCheckedChange={(v) => setMode(v ? "dark" : "light")}
              label={t.design.forms.switchLabel}
            />
          }
          last
        />
        <div className={styles.segmentBlock}>
          <p className={styles.segmentLabel}>{t.design.forms.segmentedLabel}</p>
          <Segmented options={experienceOptions} value={experience} onChange={setExperience} />
        </div>
      </div>
      <p className={styles.note}>{t.design.forms.note}</p>

      {/* ——— 11. Navigatsiya ——— */}
      <SectionHeader>{t.design.sections.navigation}</SectionHeader>
      <div className={styles.navDemo}>
        <NavBar
          title={t.design.navigation.navBarTitle}
          leading={
            <button type="button" className={styles.navIcon} aria-label={t.common.search}>
              <IconSearch size={22} />
            </button>
          }
          trailing={
            <button type="button" className={styles.navIcon} aria-label={t.common.edit}>
              <IconSliders size={22} />
            </button>
          }
          className={styles.navBorder}
        />
        <div className={styles.fabStage}>
          <div className={styles.fabSpot}>
            <Fab label={t.common.apply}>
              <IconPlus size={28} />
            </Fab>
          </div>
        </div>
        <TabBar
          active={tab}
          onChange={setTab}
          labels={{
            jobs: t.tabs.jobs,
            applications: t.tabs.applications,
            messages: t.tabs.messages,
            profile: t.tabs.profile,
          }}
          badges={{ messages: 2 }}
        />
      </div>
      <p className={styles.note}>
        {t.design.navigation.tabBarNote} {t.design.navigation.fabNote}
      </p>

      {/* ——— 12. Ikonkalar ——— */}
      <SectionHeader>{t.design.sections.icons}</SectionHeader>
      <div className={styles.panel}>
        <div className={styles.iconGrid}>
          {[
            IconBriefcase,
            IconMessage,
            IconBookmark,
            IconUser,
            IconSearch,
            IconPlus,
            IconChevronRight,
            IconMapPin,
            IconNearby,
            IconMic,
            IconCamera,
            IconVideo,
            IconClock,
            IconEye,
            IconUsers,
            IconStar,
            IconSend,
            IconBolt,
            IconShieldCheck,
            IconTrash,
            IconPencil,
            IconPhone,
            IconPlay,
            IconCard,
            IconMoon,
            IconSun,
            IconGlobe,
            IconSliders,
            IconCheck,
            IconX,
          ].map((IconComponent, i) => (
            <div key={i} className={styles.iconCell}>
              <IconComponent size={24} />
            </div>
          ))}
        </div>
        <p className={cx(styles.noteInline, styles.noteSpaced)}>{t.design.icons.note}</p>
      </div>

      {/* ——— 13. Chapga tortish ——— */}
      <SectionHeader>{t.design.sections.swipe}</SectionHeader>
      <ListGroup>
        {sampleVacancies.slice(0, 2).map((vacancy, i) => (
          <SwipeListItem
            key={vacancy.id}
            actions={[
              {
                key: "save",
                label: saved.includes(vacancy.id) ? t.common.saved : t.common.save,
                icon: <IconBookmark size={20} />,
                tone: "accent",
                onAction: () => toggleSaved(vacancy.id),
              },
              {
                key: "remove",
                label: t.common.remove,
                icon: <IconTrash size={20} />,
                tone: "danger",
                onAction: () => undefined,
              },
            ]}
          >
            <ListItem
              leading={<Avatar name={vacancy.company} />}
              title={vacancy.title[locale]}
              titleAdornment={
                saved.includes(vacancy.id) ? (
                  <IconBookmark size={14} className={styles.accentIcon} />
                ) : undefined
              }
              subtitle={formatSalary(
                vacancy.salaryMin,
                vacancy.salaryMax,
                t.job.currency,
                t.job.negotiable,
              )}
              meta={i === 0 ? t.design.swipe.hint : formatAgo(vacancy.postedMinutesAgo, t.time)}
              last={i === 1}
            />
          </SwipeListItem>
        ))}
      </ListGroup>
      <p className={styles.note}>{t.design.swipe.note}</p>

      {/* ——— 14. Qoidalar ——— */}
      {/* ——— Animatsiya ——— */}
      <SectionHeader>{t.design.sections.motion}</SectionHeader>
      <div className={styles.stack}>
        <div className={styles.rowBetween}>
          <span className={styles.body}>{t.design.motion.tap}</span>
          <button type="button" className={cx("tap", styles.tapButton)}>
            {t.common.example}
          </button>
        </div>

        <div className={cx(styles.divider, "hairline", "hairline-inset-sm")} />

        <div>
          <div className={styles.rowBetween}>
            <span className={styles.body}>{t.design.motion.row}</span>
            <Button size="sm" variant="secondary" onClick={() => setMotionKey((n) => n + 1)}>
              {t.design.motion.replay}
            </Button>
          </div>
          <div key={motionKey} className={styles.motionStage}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cx("animate-row-in", styles.motionRow)}>
                <span className={cx("skeleton", styles.motionAvatar)} />
                <span className={cx("skeleton", styles.motionLine)} />
              </div>
            ))}
          </div>
        </div>

        <ul className={styles.notes}>
          {[t.design.motion.page, t.design.motion.sheet, t.design.motion.badge].map((line) => (
            <li key={line} className={styles.caption}>
              {line}
            </li>
          ))}
        </ul>
        <p className={styles.noteInline}>{t.design.motion.note}</p>
      </div>

      <SectionHeader>{t.design.sections.principles}</SectionHeader>
      <ListGroup>
        {[
          t.design.principles.one,
          t.design.principles.two,
          t.design.principles.three,
          t.design.principles.four,
          t.design.principles.five,
        ].map((rule, i, arr) => (
          <div
            key={i}
            className={cx(styles.principle, i !== arr.length - 1 && "hairline hairline-inset-sm")}
          >
            <span className={styles.principleNumber}>{i + 1}</span>
            <span className={styles.principleText}>{rule}</span>
          </div>
        ))}
      </ListGroup>

      {/* ——— Sheetlar ——— */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        closeLabel={t.common.close}
        footer={
          <Button
            block
            size="lg"
            variant={applied ? "secondary" : "primary"}
            leading={applied ? <IconCheck size={20} /> : undefined}
            onClick={() => setApplied(true)}
          >
            {applied ? t.common.applied : t.common.apply}
          </Button>
        }
      >
        <div className={shared.sheetBody}>
          <div className={styles.sheetHead}>
            <Avatar name={t.design.sheet.company} size={52} online />
            <div className={styles.sheetHeadText}>
              <h3 className={styles.sheetTitle}>{t.design.sheet.title}</h3>
              <p className={styles.sheetCompany}>{t.design.sheet.company}</p>
            </div>
          </div>

          <p className={styles.sheetSalary}>
            {formatSalary(4_000_000, 6_000_000, t.job.currency, t.job.negotiable)}
          </p>

          <div className={shared.tagRow}>
            <Tag tone="success" icon={<IconBolt size={13} />}>
              {t.job.fastReply}
            </Tag>
            <Tag tone="accent" icon={<IconShieldCheck size={13} />}>
              {t.job.verified}
            </Tag>
            <Tag tone="neutral" icon={<IconMapPin size={13} />}>
              {t.design.sheet.location}
            </Tag>
            <Tag tone="neutral" icon={<IconClock size={13} />}>
              {t.design.sheet.schedule}
            </Tag>
          </div>

          <p className={styles.sheetDescription}>{t.design.sheet.description}</p>

          <div className={styles.sheetStats}>
            <span className={styles.sheetStat}>
              <IconEye size={15} /> 248 {t.job.views}
            </span>
            <span className={styles.sheetStat}>
              <IconUsers size={15} /> 12 {t.job.applications}
            </span>
          </div>
        </div>
      </Sheet>

      <Sheet
        open={professionSheetOpen}
        onClose={() => setProfessionSheetOpen(false)}
        closeLabel={t.common.close}
        title={t.design.forms.selectLabel}
      >
        <ListGroup>
          {sampleProfessions.map((p, i) => (
            <ListItem
              key={p.id}
              title={<span className={styles.body}>{p.name[locale]}</span>}
              insetSeparator={false}
              last={i === sampleProfessions.length - 1}
              trailing={
                selectedProfession === p.id ? (
                  <IconCheck size={20} className={styles.accentIcon} />
                ) : undefined
              }
              onClick={() => {
                setSelectedProfession(p.id);
                setProfessionSheetOpen(false);
              }}
            />
          ))}
        </ListGroup>
      </Sheet>
    </div>
  );
}

/* ——— Yordamchi komponentlar (faqat shu sahifa uchun) ——— */

function TypeSample({ spec, children }: { spec: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={styles.sampleText}>{children}</div>
      <p className={styles.sampleSpec}>{spec}</p>
    </div>
  );
}
