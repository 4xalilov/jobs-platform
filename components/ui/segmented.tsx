"use client";

import { cn } from "@/lib/utils";

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
    <div
      role="tablist"
      aria-label={label}
      className={cn("relative flex rounded-tg-sm bg-fill p-[3px]", className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-[3px] bottom-[3px] rounded-[0.5rem] bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-[var(--ease-tg)]"
        style={{
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(calc(${index} * 100%))`,
          left: 3,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative z-10 flex-1 rounded-[0.5rem] px-2 py-1.5 text-caption font-medium whitespace-nowrap",
            "transition-colors duration-150",
            option.value === value ? "text-fg" : "text-fg-secondary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
