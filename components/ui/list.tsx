import { cn } from "@/lib/utils";
import { IconChevronRight } from "./icon";

/** Bo'lim sarlavhasi: kichik, kulrang, BOSH HARFLARDA */
export function SectionHeader({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between px-4 pt-5 pb-1.5", className)}>
      <h2 className="text-section text-text-secondary uppercase">{children}</h2>
      {action}
    </div>
  );
}

/** Ro'yxat guruhi — oq yuza, elementlar orasida ingichka chiziq */
export function ListGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("bg-surface", className)}>{children}</div>;
}

export type ListItemProps = {
  /** Chapda: avatar yoki ikonka */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** O'rtada sarlavha ostidagi qisqa izoh */
  subtitle?: React.ReactNode;
  /** Uchinchi qator — masalan joylashuv yoki vaqt */
  caption?: React.ReactNode;
  /** Sarlavha yonidagi belgilar */
  titleAdornment?: React.ReactNode;
  /** O'ngda yuqorida: vaqt */
  meta?: React.ReactNode;
  /** O'ngda pastda: belgi (badge) */
  trailing?: React.ReactNode;
  chevron?: boolean;
  /** Oxirgi element — ajratuvchi chiziq chizilmaydi */
  last?: boolean;
  /** Chiziq avatardan keyin boshlansinmi */
  insetSeparator?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ListItem({
  leading,
  title,
  subtitle,
  caption,
  titleAdornment,
  meta,
  trailing,
  chevron = false,
  last = false,
  insetSeparator = true,
  onClick,
  className,
}: ListItemProps) {
  const interactive = Boolean(onClick);
  const Comp = (interactive ? "button" : "div") as React.ElementType;

  return (
    <Comp
      {...(interactive ? { type: "button" as const, onClick } : {})}
      className={cn(
        "relative flex w-full items-center gap-3 bg-surface px-4 py-2.5 text-left",
        interactive && "transition-colors duration-100 active:bg-surface-pressed",
        !last && "hairline",
        !last && (insetSeparator ? (leading ? "hairline-inset" : "hairline-inset-sm") : ""),
        className,
      )}
    >
      {leading}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-title truncate text-text">{title}</span>
          {titleAdornment}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-body text-text-secondary">{subtitle}</span>
        )}
        {caption && (
          <span className="mt-0.5 block truncate text-caption text-text-tertiary">{caption}</span>
        )}
      </span>

      {(meta || trailing) && (
        <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
          {meta && <span className="text-caption text-text-tertiary">{meta}</span>}
          {trailing}
        </span>
      )}

      {chevron && <IconChevronRight size={20} className="shrink-0 text-text-tertiary" />}
    </Comp>
  );
}
