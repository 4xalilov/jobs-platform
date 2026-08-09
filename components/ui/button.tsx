"use client";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  leading?: React.ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent active:bg-accent-pressed",
  secondary: "bg-fill text-text active:bg-separator",
  ghost: "bg-transparent text-accent active:bg-fill",
  danger: "bg-fill text-danger active:bg-separator",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-caption rounded-tg-sm gap-1.5",
  md: "h-10 px-4 text-body rounded-tg-sm gap-2",
  lg: "h-12 px-5 text-title rounded-tg gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  leading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-[transform,background-color] duration-100 ease-[var(--ease-tg)]",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Dots /> : leading}
      {children}
    </button>
  );
}

/** Spinner emas — uch nuqta, Telegram uslubida */
function Dots() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current opacity-40 motion-safe:animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

/** Asosiy harakat uchun pastda o'ngda floating tugma */
export function Fab({
  className,
  children,
  label,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-14 items-center justify-center rounded-full",
        "bg-accent text-on-accent shadow-[0_4px_14px_rgba(34,158,217,0.4)]",
        "transition-transform duration-100 ease-[var(--ease-tg)] active:scale-95 active:bg-accent-pressed",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
