"use client";

import { cn } from "@/lib/utils";

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
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5",
        "text-body font-medium whitespace-nowrap",
        "transition-[background-color,transform] duration-100 ease-[var(--ease-tg)] active:scale-[0.97]",
        selected ? "bg-accent text-on-accent" : "bg-fill text-fg-secondary",
        className,
      )}
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
  return (
    <div className={cn("no-scrollbar flex gap-2 overflow-x-auto px-4 py-2", className)}>
      {children}
    </div>
  );
}
