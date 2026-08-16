"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Screen } from "@/components/app/screen";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCard, IconCheck } from "@/components/ui/icon";
import { ListGroup } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { plans, type Plan } from "@/lib/plans";
import { useSheet } from "@/lib/use-sheet";
import { cn, formatNumber } from "@/lib/utils";

/** Tariflar — ish qidiruvchi uchun bepul, ish beruvchi to'laydi */
export default function PlansPage() {
  const { t } = useI18n();
  const payment = useSheet<Plan>();

  const label = (plan: Plan) => t.employer.plans[plan.id];
  const description = (plan: Plan) =>
    plan.id === "free"
      ? t.employer.plans.freeDesc
      : plan.id === "standard"
        ? t.employer.plans.standardDesc
        : plan.id === "premium"
          ? t.employer.plans.premiumDesc
          : plan.id === "pack"
            ? t.employer.plans.packDesc
            : t.employer.plans.databaseDesc;

  const price = (plan: Plan) =>
    plan.price === 0
      ? t.employer.plans.free0
      : `${formatNumber(plan.price)} ${t.job.currency}${plan.monthly ? `/${t.employer.plans.perMonth}` : ""}`;

  return (
    <Screen title={t.employer.plans.title}>
      <ListGroup className="mt-3">
        {plans.map((plan, i) => {
          const current = plan.id === "free";
          return (
            <button
              key={plan.id}
              type="button"
              disabled={current}
              onClick={() => payment.open(plan)}
              className={cn(
                "relative flex w-full items-start gap-3 bg-surface px-4 py-3.5 text-left",
                "transition-colors duration-100 active:bg-surface-pressed",
                i !== plans.length - 1 && "hairline hairline-inset-sm",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-nav text-fg">{label(plan)}</span>
                  {current && <Tag tone="accent">{t.employer.plans.current}</Tag>}
                </span>
                <span className="mt-1 block text-body text-fg-secondary">{description(plan)}</span>
              </span>
              <span className="shrink-0 pt-0.5 text-right">
                <span className="block text-nav whitespace-nowrap text-fg">{price(plan)}</span>
                {!current && (
                  <span className="mt-0.5 block text-caption font-medium text-accent">
                    {t.employer.plans.choose}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </ListGroup>

      <p className="px-4 pt-2 text-caption text-fg-tertiary">{t.employer.plans.payHint}</p>

      <Sheet
        open={payment.isOpen}
        onClose={payment.close}
        closeLabel={t.common.close}
        title={t.employer.plans.payTitle}
      >
        <div className="px-4 pb-4">
          {payment.value && (
            <>
              <p className="text-body text-fg-secondary">{label(payment.value)}</p>
              <p className="text-[1.5rem] leading-7 font-semibold text-fg">
                {price(payment.value)}
              </p>
              <p className="mt-1 text-body text-fg-secondary">{description(payment.value)}</p>
            </>
          )}

          <div className="mt-5 space-y-2">
            <Button block size="lg" leading={<IconCard size={20} />} disabled>
              Payme
            </Button>
            <Button block size="lg" variant="secondary" leading={<IconCard size={20} />} disabled>
              Click
            </Button>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-caption text-fg-tertiary">
            <IconCheck size={15} className="mt-px shrink-0" />
            {t.employer.plans.payHint}
          </p>
          <p className="mt-2 text-caption text-fg-tertiary">{t.employer.plans.stageNote}</p>
        </div>
      </Sheet>
    </Screen>
  );
}
