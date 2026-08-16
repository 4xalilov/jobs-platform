"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { IconArrowLeft, IconCheck } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { apiPost } from "@/lib/api";
import {
  REQUIREMENT_KEYS,
  type CityDTO,
  type EmploymentType,
  type ProfessionDTO,
  type RequirementKey,
} from "@/lib/db/types";
import { cx, formatSalary } from "@/lib/utils";
import shared from "@/styles/shared.module.scss";
import styles from "./employer.module.scss";

type Step = 1 | 2 | 3 | 4 | 5;

/** v2: lavozim, maosh, hudud, ish vaqti, talablar */
const TOTAL_STEPS = 5;

const MAX_REQUIREMENTS = 3;

const EMPLOYMENT_TYPES: EmploymentType[] = ["full", "part", "shift", "temporary"];

const SALARY_RANGES: { min: number | null; max: number | null }[] = [
  { min: 2_000_000, max: 3_000_000 },
  { min: 3_000_000, max: 4_000_000 },
  { min: 4_000_000, max: 6_000_000 },
  { min: 6_000_000, max: 8_000_000 },
  { min: 8_000_000, max: 12_000_000 },
  { min: 12_000_000, max: null },
  // "Kelishilgan holda" oxirida — ogohlantirish bilan
  { min: null, max: null },
];

/**
 * Vakansiya joylash — 5 maydon, har qadamda bitta savol, 90 sekund ichida.
 * Erkin matnli tavsif yo'q: v2 da talablar ro'yxatdan tanlanadi.
 */
export function NewVacancyFlow({
  professions,
  cities,
}: {
  professions: ProfessionDTO[];
  cities: CityDTO[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [salaryIndex, setSalaryIndex] = useState<number | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [employment, setEmployment] = useState<EmploymentType | null>(null);
  const [requirements, setRequirements] = useState<RequirementKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const city = cities.find((item) => item.id === cityId);
  const needsDistrict = Boolean(city && city.districts.length > 0);
  const negotiable = salaryIndex !== null && SALARY_RANGES[salaryIndex].min === null;

  const toggleRequirement = (key: RequirementKey) =>
    setRequirements((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : prev.length >= MAX_REQUIREMENTS
          ? prev
          : [...prev, key],
    );

  const publish = async () => {
    setSaving(true);
    const range = salaryIndex !== null ? SALARY_RANGES[salaryIndex] : { min: null, max: null };
    await apiPost("/employer/vacancies", {
      professionId,
      title: title.trim(),
      cityId,
      districtId,
      salaryMin: range.min,
      salaryMax: range.max,
      employment: employment ?? "full",
      requirements,
    });
    setDone(true);
    router.refresh();
  };

  if (done) {
    return (
      <div className={styles.doneScreen}>
        <div className={styles.doneBody}>
          <span className={styles.doneMark}>
            <IconCheck size={34} />
          </span>
          <h1 className={styles.doneTitle}>{t.employer.post.published}</h1>
          <p className={styles.doneHint}>{t.employer.post.publishedHint}</p>
        </div>
        <div className={styles.doneActions}>
          <Button block size="lg" onClick={() => router.replace("/employer/plans")}>
            {t.employer.post.toPlans}
          </Button>
          <Button
            block
            size="lg"
            variant="ghost"
            onClick={() => router.replace("/employer/vacancies")}
          >
            {t.employer.post.toVacancies}
          </Button>
        </div>
      </div>
    );
  }

  const canContinue =
    step === 1
      ? professionId !== null
      : step === 2
        ? salaryIndex !== null
        : step === 3
          ? cityId !== null && (!needsDistrict || districtId !== null)
          : step === 4
            ? employment !== null
            : true;

  const question = t.employer.post[`q${step}` as `q${Step}`];
  const hint = t.employer.post[`q${step}Hint` as `q${Step}Hint`];

  return (
    <div className={styles.flow}>
      <NavBar
        className={cx(styles.flowBar, "hairline")}
        title={t.employer.post.title}
        leading={
          <button
            type="button"
            aria-label={t.common.back}
            onClick={() => (step === 1 ? router.back() : setStep((step - 1) as Step))}
            className={styles.backButton}
          >
            <IconArrowLeft size={24} />
          </button>
        }
      />

      <div className={cx(styles.progress, "hairline")}>
        <p className={styles.progressLabel}>
          {t.employer.post.step} {step} {t.employer.post.of} {TOTAL_STEPS}
        </p>
        <div className={styles.progressTrack}>
          {[1, 2, 3, 4, 5].map((index) => (
            <span
              key={index}
              className={cx(styles.progressStep, index <= step && styles.progressStepDone)}
            />
          ))}
        </div>
      </div>

      <div className={styles.flowBody}>
        <div className={styles.question}>
          <h2 className={styles.questionTitle}>{question}</h2>
          <p className={styles.questionHint}>{hint}</p>
        </div>

        {/* 1. Lavozim — ro'yxatdan tanlanadi, xohlasa aniqlashtirib yoziladi */}
        {step === 1 && (
          <>
            <ListGroup>
              {professions.map((option, i) => (
                <PickRow
                  key={option.id}
                  label={option.name[locale]}
                  selected={professionId === option.id}
                  last={i === professions.length - 1}
                  // Bu yerda o'zi keyingi qadamga o'tmaydi: tanlagach
                  // ixtiyoriy "lavozim nomi" maydoni ochiladi
                  onSelect={() => {
                    setProfessionId(option.id);
                    setTitle("");
                  }}
                />
              ))}
            </ListGroup>

            {professionId && (
              <>
                <p className={shared.fieldLabel}>{t.employer.post.titleLabel}</p>
                <ListGroup>
                  <TextField
                    value={title}
                    onValueChange={setTitle}
                    placeholder={
                      professions.find((item) => item.id === professionId)?.name[locale] ?? ""
                    }
                  />
                </ListGroup>
                <p className={shared.hint}>{t.employer.post.titleHint}</p>
              </>
            )}
          </>
        )}

        {/* 2. Maosh */}
        {step === 2 && (
          <>
            <ListGroup>
              {SALARY_RANGES.map((range, i) => (
                <PickRow
                  key={i}
                  label={formatSalary(range.min, range.max, t.job.currency, t.job.negotiable)}
                  selected={salaryIndex === i}
                  last={i === SALARY_RANGES.length - 1}
                  onSelect={() => {
                    setSalaryIndex(i);
                    if (SALARY_RANGES[i].min !== null) setStep(3);
                  }}
                />
              ))}
            </ListGroup>

            {/* Maoshsiz vakansiya kam ariza oladi — buni yashirmaymiz */}
            {negotiable && (
              <div className={styles.warning}>
                <p className={styles.warningText}>{t.employer.post.salaryWarning}</p>
              </div>
            )}
          </>
        )}

        {/* 3. Hudud */}
        {step === 3 && (
          <>
            <ListGroup>
              {cities.map((option, i) => (
                <PickRow
                  key={option.id}
                  label={option.name[locale]}
                  selected={cityId === option.id}
                  last={i === cities.length - 1}
                  onSelect={() => {
                    setCityId(option.id);
                    setDistrictId(null);
                    if (option.districts.length === 0) setStep(4);
                  }}
                />
              ))}
            </ListGroup>

            {needsDistrict && city && (
              <>
                <p className={shared.fieldLabel}>{t.screens.card.district}</p>
                <ListGroup>
                  {city.districts.map((option, i) => (
                    <PickRow
                      key={option.id}
                      label={option.name[locale]}
                      selected={districtId === option.id}
                      last={i === city.districts.length - 1}
                      onSelect={() => {
                        setDistrictId(option.id);
                        setStep(4);
                      }}
                    />
                  ))}
                </ListGroup>
              </>
            )}
          </>
        )}

        {/* 4. Ish vaqti */}
        {step === 4 && (
          <ListGroup>
            {EMPLOYMENT_TYPES.map((option, i) => (
              <PickRow
                key={option}
                label={t.job.employment[option]}
                selected={employment === option}
                last={i === EMPLOYMENT_TYPES.length - 1}
                onSelect={() => {
                  setEmployment(option);
                  setStep(5);
                }}
              />
            ))}
          </ListGroup>
        )}

        {/* 5. Talablar — 3 tagacha, yozilmaydi */}
        {step === 5 && (
          <>
            <ListGroup>
              {REQUIREMENT_KEYS.map((key, i) => {
                const selected = requirements.includes(key);
                const full = requirements.length >= MAX_REQUIREMENTS && !selected;
                return (
                  <PickRow
                    key={key}
                    label={t.employer.requirements[key]}
                    selected={selected}
                    dimmed={full}
                    last={i === REQUIREMENT_KEYS.length - 1}
                    onSelect={() => toggleRequirement(key)}
                  />
                );
              })}
            </ListGroup>
            <p className={shared.hint}>
              {requirements.length} / {MAX_REQUIREMENTS}
            </p>
          </>
        )}
      </div>

      <div className={styles.flowFooter}>
        <Button
          block
          size="lg"
          loading={saving}
          disabled={!canContinue || saving}
          onClick={() => (step === TOTAL_STEPS ? void publish() : setStep((step + 1) as Step))}
        >
          {step === TOTAL_STEPS ? t.employer.post.publish : t.employer.post.next}
        </Button>
      </div>
    </div>
  );
}

function PickRow({
  label,
  selected,
  dimmed = false,
  last,
  onSelect,
}: {
  label: string;
  selected: boolean;
  dimmed?: boolean;
  last: boolean;
  onSelect: () => void;
}) {
  return (
    <ListItem
      title={<span className={cx(shared.rowTitle, dimmed && shared.rowTitleDimmed)}>{label}</span>}
      compact
      insetSeparator={false}
      last={last}
      trailing={selected ? <IconCheck size={20} className={shared.accentIcon} /> : undefined}
      onClick={onSelect}
    />
  );
}
