"use client";

import { cx } from "@/lib/utils";
import styles from "./button.module.scss";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  leading?: React.ReactNode;
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
      className={cx(styles.button, styles[variant], styles[size], block && styles.block, className)}
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
    <span className={styles.dots} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={styles.dot} style={{ animationDelay: `${i * 150}ms` }} />
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
    <button type="button" aria-label={label} className={cx(styles.fab, className)} {...props}>
      {children}
    </button>
  );
}
