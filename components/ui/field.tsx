"use client";

import { cx } from "@/lib/utils";
import { IconChevronRight } from "./icon";
import styles from "./field.module.scss";

/** Bitta savol — bitta maydon. Ramka yo'q, faqat yuza va ingichka chiziq. */
export function TextField({
  value,
  onValueChange,
  placeholder,
  inputMode,
  className,
  autoFocus,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      autoFocus={autoFocus}
      className={cx(styles.input, className)}
    />
  );
}

/** Ro'yxatdan tanlanadigan maydon — bosilganda sheet ochiladi (yozilmaydi) */
export function SelectField({
  label,
  value,
  placeholder,
  onClick,
  last = false,
  className,
}: {
  label: string;
  value?: string | null;
  placeholder: string;
  onClick: () => void;
  last?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(styles.select, !last && "hairline hairline-inset-sm", className)}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        <span className={cx(styles.valueText, !value && styles.placeholder)}>
          {value || placeholder}
        </span>
        <IconChevronRight size={18} className={styles.chevron} />
      </span>
    </button>
  );
}

/** Forma qatori: chapda nom, o'ngda boshqaruv (switch va h.k.) */
export function FieldRow({
  label,
  hint,
  control,
  last = false,
  className,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
  last?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(styles.row, !last && "hairline hairline-inset-sm", className)}>
      <span className={styles.rowText}>
        <span className={cx(styles.label, styles.rowLabel)}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      {control}
    </div>
  );
}
