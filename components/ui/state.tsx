"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { IconRefresh, IconWarning } from "@/components/ui/icon";
import { ListSkeleton, type SkeletonShape } from "@/components/ui/skeleton";
import { cx } from "@/lib/utils";
import styles from "./state.module.scss";

/**
 * Uch holatning yagona tizimi (v5, 2.8).
 *
 * Auditda topilgan eng katta sifat bo'shlig'i shu edi: 9 ta bo'sh
 * holatdan 7 tasida chiqish yo'li yo'q, 12 ta ro'yxat ekranidan
 * 10 tasida skelet yo'q, xato holati esa umuman loyihalanmagan
 * (AUDIT.md, 6-bo'lim).
 *
 * Butun ilovada faqat shu uchtasi ishlatiladi. Har biri o'z shartini
 * turlar orqali majburlaydi — masalan `EmptyState` da harakat tugmasi
 * ixtiyoriy emas.
 *
 * Umumiy matnlar ("Yuklanmoqda", "Qayta urinish") komponent ichida
 * i18n dan olinadi: ularni har chaqiruvda uzatish matnning ikkinchi
 * nusxasini yaratardi.
 */

/* ——————————————————————————————————————————————
   Bo'sh holat
   —————————————————————————————————————————————— */

/**
 * Harakat tugmasi **majburiy**.
 *
 * «Hech narsa yo'q» — bu boshi berk ko'cha. «Hech narsa yo'q, mana
 * shularni ko'ring» — bu yo'l. Ixtiyoriy qilinsa, ertami-kechmi
 * unutiladi: v4 da aynan shunday bo'lgan.
 */
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  /** Majburiy: bo'sh ekrandan chiqish yo'li bo'lishi kerak */
  action: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(styles.state, className)} role="status">
      <span className={styles.icon}>{icon}</span>
      <p className={styles.title}>{title}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.action}>{action}</div>
    </div>
  );
}

/* ——————————————————————————————————————————————
   Yuklanish holati
   —————————————————————————————————————————————— */

/**
 * Skelet — haqiqiy kontentning shakli, spinner emas.
 *
 * Spinner «kuting» deydi, skelet «mana bu keladi» deydi. Ikkinchisi
 * kutishni qisqartirmaydi, lekin uni kutish deb sezdirmaydi.
 *
 * `shape` — qaysi qator taqlid qilinishi. Balandligi haqiqiy element
 * bilan bir xil bo'lishi kerak, aks holda kontent kelganda layout
 * sakraydi (CLS).
 */
export function LoadingState({
  shape = "list",
  rows,
  className,
}: {
  shape?: SkeletonShape;
  rows?: number;
  className?: string;
}) {
  const { t } = useI18n();
  const count = rows ?? (shape === "text" ? 1 : 5);

  return (
    <div className={className} role="status" aria-busy="true">
      <span className={styles.srOnly}>{t.common.loading}</span>
      <ListSkeleton rows={count} shape={shape} />
    </div>
  );
}

/* ——————————————————————————————————————————————
   Xato holati
   —————————————————————————————————————————————— */

/**
 * Sabab + yechim + qayta urinish.
 *
 * `reason` odam tilida bo'lishi kerak — stack trace emas. Server
 * xatolari `lib/db/client.ts` da allaqachon tarjima qilinadi, bu
 * komponent shu matnni ko'rsatadi.
 */
export function ErrorState({
  title,
  reason,
  hint,
  onRetry,
  className,
}: {
  /** Berilmasa umumiy sarlavha ishlatiladi */
  title?: string;
  /** Nima bo'ldi — foydalanuvchi tushunadigan tilda */
  reason?: string;
  /** Nima qilish kerak; berilmasa umumiy maslahat */
  hint?: string;
  onRetry: () => void;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <div className={cx(styles.state, className)} role="alert">
      <span className={cx(styles.icon, styles.iconError)}>
        <IconWarning size={44} />
      </span>
      <p className={styles.title}>{title ?? t.common.errorTitle}</p>
      {reason && <p className={styles.reason}>{reason}</p>}
      <p className={styles.hint}>{hint ?? t.common.errorHint}</p>
      <div className={styles.action}>
        <Button variant="secondary" leading={<IconRefresh size={18} />} onClick={onRetry}>
          {t.common.retry}
        </Button>
      </div>
    </div>
  );
}
