import { cn } from "@/lib/utils";
import { IconChevronRight } from "./icon";

/** Bo'lim sarlavhasi: 13px, kulrang, BOSH HARFLARDA, 0.5px oraliq */
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
      <h2 className="text-section text-fg-secondary uppercase">{children}</h2>
      {action}
    </div>
  );
}

/** Ro'yxat guruhi — oq yuza, elementlar orasida 0.5px chiziq */
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
  /** Chapda: avatar (48px) yoki ikonka */
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
  /** O'qilmagan — sarlavha 600 ga o'tadi */
  unread?: boolean;
  /** Vakansiya qatorida lavozim doim 600 (v3, 3-bo'lim) */
  strongTitle?: boolean;
  /** Izoh uzun bo'lsa kesilmasin, bir necha qatorga bo'linsin */
  wrapSubtitle?: boolean;
  /**
   * Sozlamalar uslubi — 44px balandlik. Standart ro'yxatda 76px.
   */
  compact?: boolean;
  /** Oxirgi element — ajratuvchi chiziq chizilmaydi */
  last?: boolean;
  /** Chiziq avatardan keyin (76px) boshlansinmi */
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
  unread = false,
  strongTitle = false,
  wrapSubtitle = false,
  compact = false,
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
        "relative flex w-full items-center gap-3 bg-surface px-4 text-left",
        compact ? "min-h-[2.75rem] py-1.5" : "min-h-[4.75rem] py-[0.875rem]",
        interactive && "tap-flat active:bg-surface-pressed",
        !last && "hairline",
        !last && (insetSeparator ? (leading ? "hairline-inset" : "hairline-inset-sm") : ""),
        className,
      )}
    >
      {leading}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-title truncate text-fg",
              unread || strongTitle ? "font-semibold" : "font-normal",
            )}
          >
            {title}
          </span>
          {titleAdornment}
        </span>
        {subtitle && (
          <span
            className={cn(
              "mt-0.5 block text-body text-fg-secondary",
              wrapSubtitle ? "whitespace-normal" : "truncate",
            )}
          >
            {subtitle}
          </span>
        )}
        {caption && (
          <span className="mt-0.5 block truncate text-caption text-fg-tertiary">{caption}</span>
        )}
      </span>

      {(meta || trailing) && (
        <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-1">
          {meta && <span className="text-caption text-fg-tertiary">{meta}</span>}
          {trailing}
        </span>
      )}

      {chevron && <IconChevronRight size={20} className="shrink-0 text-fg-tertiary" />}
    </Comp>
  );
}
