import { cx } from "@/lib/utils";
import styles from "./badge.module.scss";

type Tone = "accent" | "success" | "warning" | "neutral";

const COUNT_TONES: Record<Tone, string> = {
  accent: styles.countAccent,
  success: styles.countSuccess,
  warning: styles.countWarning,
  neutral: styles.countNeutral,
};

const TAG_TONES: Record<Tone, string> = {
  accent: styles.tagAccent,
  success: styles.tagSuccess,
  warning: styles.tagWarning,
  neutral: styles.tagNeutral,
};

/** O'qilmagan xabarlar soni — dumaloq belgi */
export function CountBadge({
  count,
  tone = "accent",
  className,
}: {
  count: number;
  tone?: Tone;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span className={cx(styles.count, COUNT_TONES[tone], className)}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Matnli belgi: "Tez javob", "Tasdiqlangan" */
export function Tag({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cx(styles.tag, TAG_TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/** Yangi element uchun kichik nuqta */
export function Dot({ className }: { className?: string }) {
  return <span className={cx(styles.dot, className)} />;
}
