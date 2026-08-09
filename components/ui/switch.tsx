"use client";

import { cn } from "@/lib/utils";

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
      className={cn(
        "relative h-[31px] w-[51px] shrink-0 rounded-full",
        "transition-colors duration-200 ease-[var(--ease-tg)]",
        checked ? "bg-accent" : "bg-text-tertiary/40",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-[var(--ease-tg)]",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
