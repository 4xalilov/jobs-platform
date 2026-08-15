"use client";

import { cx } from "@/lib/utils";
import styles from "./chip.module.scss";

export function Chip({
  selected = false,
  children,
  leading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  leading?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(styles.chip, selected && styles.selected, className)}
      {...props}
    >
      {leading}
      {children}
    </button>
  );
}

/** Gorizontal aylanadigan chip qatori — kasb filtri */
export function ChipRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx(styles.row, className)}>{children}</div>;
}
