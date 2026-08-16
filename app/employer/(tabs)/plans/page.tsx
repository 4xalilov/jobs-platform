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
import { cx, formatNumber } from "@/lib/utils";
import shared from "@/styles/shared.module.scss";
import styles from "@/components/employer/employer.module.scss";

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
      <ListGroup className={shared.groupGapSmall}>
        {plans.map((plan, i) => {
          const current = plan.id === "free";
          return (
            <button
              key={plan.id}
              type="button"
              disabled={current}
              onClick={() => payment.open(plan)}
              className={cx(styles.planRow, i !== plans.length - 1 && "hairline hairline-inset-sm")}
            >
              <span className={styles.planMain}>
                <span className={styles.planHead}>
                  <span className={styles.planName}>{label(plan)}</span>
                  {current && <Tag tone="accent">{t.employer.plans.current}</Tag>}
                </span>
                <span className={styles.planDesc}>{description(plan)}</span>
              </span>
              <span className={styles.planSide}>
                <span className={styles.planPrice}>{price(plan)}</span>
                {!current && <span className={styles.planChoose}>{t.employer.plans.choose}</span>}
              </span>
            </button>
          );
        })}
      </ListGroup>

      <p className={shared.hint}>{t.employer.plans.payHint}</p>

      <Sheet
        open={payment.isOpen}
        onClose={payment.close}
        closeLabel={t.common.close}
        title={t.employer.plans.payTitle}
      >
        <div className={shared.sheetBody}>
          {payment.value && (
            <>
              <p className={shared.bodyMuted}>{label(payment.value)}</p>
              <p className={styles.payPrice}>{price(payment.value)}</p>
              <p className={cx(shared.bodyMuted, shared.spaceTopSmall)}>
                {description(payment.value)}
              </p>
            </>
          )}

          <div className={styles.payButtons}>
            <Button block size="lg" leading={<IconCard size={20} />} disabled>
              Payme
            </Button>
            <Button block size="lg" variant="secondary" leading={<IconCard size={20} />} disabled>
              Click
            </Button>
          </div>

          <p className={styles.payNote}>
            <IconCheck size={15} className={styles.payNoteIcon} />
            {t.employer.plans.payHint}
          </p>
          <p className={cx(shared.captionMuted, shared.spaceTop)}>{t.employer.plans.stageNote}</p>
        </div>
      </Sheet>
    </Screen>
  );
}
