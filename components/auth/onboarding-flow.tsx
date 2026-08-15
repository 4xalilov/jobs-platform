"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { IconArrowLeft, IconBriefcase, IconCheck, IconUser } from "@/components/ui/icon";
import { ListGroup, ListItem } from "@/components/ui/list";
import { NavBar } from "@/components/ui/nav-bar";
import { apiPost } from "@/lib/api";
import type { CityDTO, ProfessionDTO } from "@/lib/db/types";

type Role = "nomzod" | "ish_beruvchi";
type Step = "role" | "profession" | "city" | "company" | "phone";

/**
 * Kirgandan keyingi tanishtiruv.
 * Maqsad — 60 sekund ichida birinchi arizagacha yetib borish, shuning uchun
 * bu yerda faqat eng zarur savollar bor. Qolgani Profilda to'ldiriladi.
 */
export function OnboardingFlow({
  name,
  professions,
  cities,
}: {
  name: string;
  professions: ProfessionDTO[];
  cities: CityDTO[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const finish = async (payload: Record<string, unknown>) => {
    setSaving(true);
    const { next } = await apiPost<{ next: string }>("/onboarding", { role, ...payload });
    router.replace(next);
    router.refresh();
  };

  const back = () => {
    if (step === "profession" || step === "company") setStep("role");
    else if (step === "city") setStep("profession");
    else if (step === "phone") setStep("company");
  };

  const heading = (title: string, hint: string) => (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-[1.5rem] leading-7 font-semibold text-fg">{title}</h1>
      <p className="mt-1 text-body text-fg-secondary">{hint}</p>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-[27.5rem] flex-col bg-bg">
      <NavBar
        title=""
        className="sticky top-0 z-20"
        leading={
          step === "role" ? undefined : (
            <button
              type="button"
              aria-label={t.common.back}
              onClick={back}
              className="p-2 text-accent"
            >
              <IconArrowLeft size={24} />
            </button>
          )
        }
      />

      {step === "role" && (
        <>
          <div className="px-4 pt-2">
            <p className="text-body text-fg-secondary">
              {t.auth.title} — {name}
            </p>
          </div>
          {heading(t.onboarding.roleTitle, t.onboarding.roleHint)}
          <ListGroup>
            <ListItem
              leading={<IconUser size={24} className="text-accent" />}
              title={t.onboarding.seeker}
              subtitle={t.onboarding.seekerHint}
              wrapSubtitle
              insetSeparator={false}
              chevron
              onClick={() => {
                setRole("nomzod");
                setStep("profession");
              }}
              className="py-3.5"
            />
            <ListItem
              leading={<IconBriefcase size={24} className="text-accent" />}
              title={t.onboarding.employer}
              subtitle={t.onboarding.employerHint}
              wrapSubtitle
              insetSeparator={false}
              chevron
              last
              onClick={() => {
                setRole("ish_beruvchi");
                setStep("company");
              }}
              className="py-3.5"
            />
          </ListGroup>
        </>
      )}

      {step === "profession" && (
        <>
          {heading(t.onboarding.professionTitle, t.onboarding.professionHint)}
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
                  setStep("city");
                }}
                className="py-3"
              />
            ))}
          </ListGroup>
        </>
      )}

      {step === "city" && (
        <>
          {heading(t.onboarding.cityTitle, t.onboarding.cityHint)}
          <ListGroup>
            {cities.map((option, i) => (
              <ListItem
                key={option.id}
                title={<span className="text-body font-normal">{option.name[locale]}</span>}
                insetSeparator={false}
                last={i === cities.length - 1}
                onClick={() => void finish({ professionId, cityId: option.id })}
                className="py-3"
              />
            ))}
          </ListGroup>
        </>
      )}

      {step === "company" && (
        <>
          {heading(t.onboarding.companyTitle, t.onboarding.companyHint)}
          <ListGroup>
            <TextField
              value={companyName}
              onValueChange={setCompanyName}
              placeholder={t.onboarding.companyPlaceholder}
              autoFocus
            />
          </ListGroup>
          <div className="mt-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
            <Button block size="lg" disabled={!companyName.trim()} onClick={() => setStep("phone")}>
              {t.employer.post.next}
            </Button>
          </div>
        </>
      )}

      {step === "phone" && (
        <>
          {heading(t.onboarding.phoneTitle, t.onboarding.phoneHint)}
          <ListGroup>
            <TextField
              value={phone}
              onValueChange={setPhone}
              placeholder={t.onboarding.phonePlaceholder}
              inputMode="tel"
              autoFocus
            />
          </ListGroup>
          <div className="mt-auto space-y-2 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
            <Button
              block
              size="lg"
              loading={saving}
              onClick={() => void finish({ companyName, phone })}
            >
              {t.onboarding.finish}
            </Button>
            <Button
              block
              size="lg"
              variant="ghost"
              onClick={() => void finish({ companyName, phone: "" })}
            >
              {t.onboarding.skip}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
