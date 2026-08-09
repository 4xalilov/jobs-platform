"use client";

import { cn } from "@/lib/utils";
import { IconChevronRight } from "./icon";

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
      className={cn(
        "h-12 w-full bg-surface px-4 text-title text-text",
        "placeholder:font-normal placeholder:text-text-tertiary focus:outline-none",
        className,
      )}
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
      className={cn(
        "relative flex h-12 w-full items-center justify-between gap-3 bg-surface px-4 text-left",
        "transition-colors duration-100 active:bg-surface-pressed",
        !last && "hairline hairline-inset-sm",
        className,
      )}
    >
      <span className="text-body text-text">{label}</span>
      <span className="flex min-w-0 items-center gap-1">
        <span className={cn("truncate text-body", value ? "text-text-secondary" : "text-text-tertiary")}>
          {value || placeholder}
        </span>
        <IconChevronRight size={18} className="text-text-tertiary" />
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
    <div
      className={cn(
        "relative flex min-h-12 items-center justify-between gap-3 bg-surface px-4 py-2",
        !last && "hairline hairline-inset-sm",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-body text-text">{label}</span>
        {hint && <span className="mt-0.5 block text-caption text-text-tertiary">{hint}</span>}
      </span>
      {control}
    </div>
  );
}
