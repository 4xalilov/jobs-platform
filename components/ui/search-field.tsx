"use client";

import { cn } from "@/lib/utils";
import { IconSearch, IconX } from "./icon";

export function SearchField({
  value,
  onValueChange,
  placeholder,
  clearLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-2", className)}>
      <div className="relative flex items-center rounded-tg-sm bg-fill">
        <IconSearch size={18} className="absolute left-2.5 text-text-tertiary" />
        <input
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-9 w-full bg-transparent pr-9 pl-9 text-body text-text",
            "placeholder:text-text-tertiary focus:outline-none",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        {value && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onValueChange("")}
            className="absolute right-2 flex size-6 items-center justify-center rounded-full text-text-tertiary active:bg-separator"
          >
            <IconX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
