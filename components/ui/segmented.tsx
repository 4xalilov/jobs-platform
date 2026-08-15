"use client";

import { cx } from "@/lib/utils";
import styles from "./segmented.module.scss";

export type SegmentedOption<T extends string> = { value: T; label: string };

/** Tanlov: Tajribasiz / 1 yilgacha / 1–3 yil / 3+ yil */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Ekran o'quvchi uchun nom — tarjima faylidan */
  label?: string;
  className?: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div role="tablist" aria-label={label} className={cx(styles.group, className)}>
      <span
        aria-hidden="true"
        className={styles.indicator}
        style={{
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(calc(${index} * 100%))`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={styles.option}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
