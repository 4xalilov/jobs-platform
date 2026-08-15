"use client";

import { cx } from "@/lib/utils";
import styles from "./switch.module.scss";

export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cx(styles.track, className)}
    >
      <span className={cx(styles.thumb, checked && styles.checked)} />
    </button>
  );
}
