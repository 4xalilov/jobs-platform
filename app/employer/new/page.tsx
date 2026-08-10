"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCheck, IconMic, IconX } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import {
  cities,
  cityById,
  professions,
  salaryRanges,
  type EmployerVacancy,
} from "@/lib/mock-data";
import { useMyVacancies } from "@/lib/stores";
import { cn, formatSalary } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;
type VoiceState = "idle" | "recording" | "converting";

const TOTAL_STEPS = 4;

/**
 * Vakansiya joylash — 4 qadam, har qadamda bitta savol.
 * Ko'p maydonli forma emas.
 */
export default function NewVacancyPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { publish } = useMyVacancies();

  const [step, setStep] = useState<Step>(1);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [salaryIndex, setSalaryIndex] = useState<number | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [districtIndex, setDistrictIndex] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);

  const city = cityId ? cityById(cityId) : null;
  const needsDistrict = Boolean(city && city.districts.length > 0);

  // Ovoz yozilayotgan sekundlar — tashqi taymerga obuna
  useEffect(() => {
    if (voice !== "recording") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [voice]);

  const stopRecording = () => {
    setVoice("converting");
    window.setTimeout(() => {
      setDescription(t.employer.post.voiceResult);
      setVoice("idle");
      setSeconds(0);
    }, 1200);
  };

  const goBack = () => {
    if (step === 1) router.back();
    else setStep((step - 1) as Step);
  };

  const publishVacancy = () => {
    const range = salaryIndex !== null ? salaryRanges[salaryIndex] : { min: null, max: null };
    const vacancy: EmployerVacancy = {
      id: `my-${Date.now()}`,
      professionId: professionId ?? "sotuvchi",
      cityId: cityId ?? "toshkent",
      districtIndex: districtIndex,
      salaryMin: range.min,
      salaryMax: range.max,
      employment: "full",
      description: description.trim(),
      status: "active",
      plan: "free",
      views: 0,
      applications: 0,
      newApplications: 0,
      postedMinutesAgo: 0,
      daysLeft: 30,
    };
    publish(vacancy);
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success text-white">
            <IconCheck size={34} />
          </span>
          <h1 className="mt-4 text-[20px] leading-6 font-semibold text-text">
            {t.employer.post.published}
          </h1>
          <p className="mt-2 text-body text-text-secondary">{t.employer.post.publishedHint}</p>
        </div>
        <div className="space-y-2 px-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
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
          ? cityId !== null && (!needsDistrict || districtIndex !== null)
          : description.trim().length > 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-bg">
      <NavBar
        className="sticky top-0 z-20 hairline"
        title={t.employer.post.title}
        leading={
          <button
            type="button"
            aria-label={t.common.back}
            onClick={goBack}
            className="p-2 text-accent"
          >
            <IconArrowLeft size={24} />
          </button>
        }
      />

      {/* Qadam ko'rsatkichi */}
      <div className="bg-surface px-4 pt-3 pb-4 hairline">
        <p className="text-caption text-text-secondary">
          {t.employer.post.step} {step} {t.employer.post.of} {TOTAL_STEPS}
        </p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn("h-[3px] flex-1 rounded-full", i <= step ? "bg-accent" : "bg-fill")}
            />
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="px-4 pt-5 pb-3">
          <h2 className="text-[22px] leading-7 font-semibold text-text">{question(step, t)}</h2>
          <p className="mt-1 text-body text-text-secondary">{hint(step, t)}</p>
        </div>

        {step === 1 && (
          <ListGroup>
            {professions.map((option, i) => (
              <ListItem
                key={option.id}
                title={<span className="text-body font-normal">{option.name[locale]}</span>}
                insetSeparator={false}
                last={i === professions.length - 1}
                trailing={
                  professionId === option.id ? (
                    <IconCheck size={20} className="text-accent" />
                  ) : undefined
                }
                onClick={() => {
                  setProfessionId(option.id);
                  setStep(2);
                }}
                className="py-3"
              />
            ))}
          </ListGroup>
        )}

        {step === 2 && (
          <ListGroup>
            {salaryRanges.map((range, i) => (
              <ListItem
                key={i}
                title={
                  <span className="text-body font-normal">
                    {formatSalary(range.min, range.max, t.job.currency, t.job.negotiable)}
                  </span>
                }
                insetSeparator={false}
                last={i === salaryRanges.length - 1}
                trailing={
                  salaryIndex === i ? <IconCheck size={20} className="text-accent" /> : undefined
                }
                onClick={() => {
                  setSalaryIndex(i);
                  setStep(3);
                }}
                className="py-3"
              />
            ))}
          </ListGroup>
        )}

        {step === 3 && (
          <>
            <ListGroup>
              {cities.map((option, i) => (
                <ListItem
                  key={option.id}
                  title={<span className="text-body font-normal">{option.name[locale]}</span>}
                  insetSeparator={false}
                  last={i === cities.length - 1}
                  trailing={
                    cityId === option.id ? (
                      <IconCheck size={20} className="text-accent" />
                    ) : undefined
                  }
                  onClick={() => {
                    setCityId(option.id);
                    setDistrictIndex(null);
                    if (option.districts.length === 0) setStep(4);
                  }}
                  className="py-3"
                />
              ))}
            </ListGroup>

            {needsDistrict && city && (
              <>
                <p className="px-4 pt-5 pb-1.5 text-section text-text-secondary uppercase">
                  {t.screens.card.district}
                </p>
                <ListGroup>
                  {city.districts.map((district, i) => (
                    <ListItem
                      key={district.uz}
                      title={<span className="text-body font-normal">{district[locale]}</span>}
                      insetSeparator={false}
                      last={i === city.districts.length - 1}
                      trailing={
                        districtIndex === i ? (
                          <IconCheck size={20} className="text-accent" />
                        ) : undefined
                      }
                      onClick={() => {
                        setDistrictIndex(i);
                        setStep(4);
                      }}
                      className="py-3"
                    />
                  ))}
                </ListGroup>
              </>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div className="bg-surface">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.employer.post.descriptionPlaceholder}
                rows={5}
                className="w-full resize-none bg-transparent px-4 py-3 text-body text-text placeholder:text-text-tertiary focus:outline-none"
              />
            </div>

            {/* Ovozli vakansiya — yozishni yoqtirmaganlar uchun */}
            <div className="mt-5 bg-surface px-4 py-4">
              {voice === "idle" && (
                <>
                  <Button
                    block
                    variant="secondary"
                    size="lg"
                    leading={<IconMic size={20} />}
                    onClick={() => {
                      setSeconds(0);
                      setVoice("recording");
                    }}
                  >
                    {t.employer.post.voice}
                  </Button>
                  <p className="mt-2 text-caption text-text-tertiary">
                    {t.employer.post.voiceHint}
                  </p>
                </>
              )}

              {voice === "recording" && (
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger text-white">
                    <IconMic size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-body text-text">
                      {t.employer.post.voiceRecording}
                    </span>
                    <span className="block text-caption text-text-tertiary tabular-nums">
                      0:{String(Math.min(seconds, 30)).padStart(2, "0")} / 0:30
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={t.employer.post.voiceStop}
                    onClick={stopRecording}
                    className="flex size-10 items-center justify-center rounded-full bg-fill text-text"
                  >
                    <IconX size={20} />
                  </button>
                </div>
              )}

              {voice === "converting" && (
                <div className="flex items-center gap-3">
                  <span className="skeleton size-10 shrink-0 rounded-full" />
                  <span className="flex-1 text-body text-text-secondary">
                    {t.employer.post.voiceConverting}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-separator bg-surface px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <Button
          block
          size="lg"
          disabled={!canContinue}
          onClick={() => (step === 4 ? publishVacancy() : setStep((step + 1) as Step))}
        >
          {step === 4 ? t.employer.post.publish : t.employer.post.next}
        </Button>
      </div>
    </div>
  );
}

function question(step: Step, t: ReturnType<typeof useI18n>["t"]): string {
  return step === 1
    ? t.employer.post.q1
    : step === 2
      ? t.employer.post.q2
      : step === 3
        ? t.employer.post.q3
        : t.employer.post.q4;
}

function hint(step: Step, t: ReturnType<typeof useI18n>["t"]): string {
  return step === 1
    ? t.employer.post.q1Hint
    : step === 2
      ? t.employer.post.q2Hint
      : step === 3
        ? t.employer.post.q3Hint
        : t.employer.post.q4Hint;
}
