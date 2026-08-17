"use client";

import { useRef } from "react";
import { haptic } from "@/lib/haptics";
import { cx } from "@/lib/utils";
import styles from "./segmented.module.scss";

export type SegmentedOption<T extends string> = { value: T; label: string };

/**
 * Tanlov: Tajribasiz / 1 yilgacha / 1–3 yil / 3+ yil
 *
 * Semantikasi `radiogroup` (v5, B2). Ilgari `tablist` edi va bu xato:
 * tab varaqlar orasida almashadi, bu esa bitta qiymatni tanlaydi.
 * Ekran o'quvchi "3 tadan 2-si tanlangan" deb aytishi uchun
 * `radiogroup`/`radio` kerak — auditda topilgan xato (AUDIT.md, 6).
 *
 * Klaviatura: guruhga bitta Tab bilan kiriladi (faqat tanlangani
 * tartibda), keyin strelkalar tanlovni ko'chiradi. Radio guruhining
 * standart xatti-harakati shu.
 */
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
  const group = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const select = (next: T) => {
    if (next === value) return;
    haptic("select");
    onChange(next);
  };

  /** Strelkalar bilan ko'chish; oxiridan boshiga o'tadi */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;

    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    select(options[next].value);
    // Fokus tanlangan bo'lak bilan birga ketadi
    group.current?.querySelectorAll<HTMLButtonElement>("[role='radio']")[next]?.focus();
  };

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx(styles.group, className)}
    >
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
          role="radio"
          aria-checked={option.value === value}
          /* Guruh bitta to'xtash joyi: Tab ichkariga kirmaydi, o'tib ketadi */
          tabIndex={option.value === value ? 0 : -1}
          onClick={() => select(option.value)}
          className={styles.option}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
