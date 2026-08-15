"use client";

import { cn } from "@/lib/utils";
import { IconSearch, IconX } from "./icon";

const SHELL = "relative flex h-9 items-center rounded-tg-sm bg-fill";

/** Qidiruv maydoni — yuqorida turadi, pastga tortilganda ko'rinadi */
export function SearchField({
  value,
  onValueChange,
  placeholder,
  clearLabel,
  autoFocus,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-2", className)}>
      <div className={SHELL}>
        <IconSearch size={18} className="absolute left-2.5 text-fg-tertiary" />
        <input
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-full w-full bg-transparent pr-9 pl-9 text-body text-fg",
            "placeholder:text-fg-tertiary focus:outline-none",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        {value && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onValueChange("")}
            className="absolute right-2 flex size-6 items-center justify-center rounded-full text-fg-tertiary active:bg-separator"
          >
            <IconX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Ro'yxat tepasidagi qidiruv — bosilganda qidiruv ekraniga o'tadi.
 * Maydonga o'xshaydi, lekin klaviatura ochilmaydi.
 */
export function SearchFieldButton({
  placeholder,
  onClick,
  className,
}: {
  placeholder: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-2", className)}>
      <button type="button" onClick={onClick} className={cn(SHELL, "w-full text-left")}>
        <IconSearch size={18} className="absolute left-2.5 text-fg-tertiary" />
        <span className="pl-9 text-body text-fg-tertiary">{placeholder}</span>
      </button>
    </div>
  );
}
