import { cn } from "@/lib/utils";

type Tone = "accent" | "success" | "warning" | "neutral";

const TONES: Record<Tone, string> = {
  accent: "bg-accent text-on-accent",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  neutral: "bg-text-tertiary text-white",
};

/** O'qilmagan xabarlar soni — dumaloq belgi */
export function CountBadge({
  count,
  tone = "accent",
  className,
}: {
  count: number;
  tone?: Tone;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5",
        "text-caption font-medium tabular-nums",
        TONES[tone],
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Matnli belgi: "Tez javob", "Tasdiqlangan" */
export function Tag({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  const soft: Record<Tone, string> = {
    accent: "bg-accent-soft text-accent",
    success: "bg-success/12 text-success",
    warning: "bg-warning/12 text-warning",
    neutral: "bg-fill text-text-secondary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium",
        soft[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Yangi element uchun kichik nuqta */
export function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block size-2 rounded-full bg-accent", className)} />;
}
