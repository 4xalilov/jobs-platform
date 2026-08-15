import { cx } from "@/lib/utils";
import { IconChevronRight } from "./icon";
import styles from "./list.module.scss";

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
    <div className={cx(styles.sectionHeader, className)}>
      <h2 className={styles.sectionTitle}>{children}</h2>
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
  return <div className={cx(styles.group, className)}>{children}</div>;
}

export type ListItemProps = {
  /** Chapda: avatar (3rem) yoki ikonka */
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
   * Sozlamalar uslubi — 2.75rem balandlik. Standart ro'yxatda 4.75rem.
   */
  compact?: boolean;
  /** Oxirgi element — ajratuvchi chiziq chizilmaydi */
  last?: boolean;
  /** Chiziq avatardan keyin (4.75rem) boshlansinmi */
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
      className={cx(
        styles.item,
        compact && styles.compact,
        interactive && styles.interactive,
        !last && "hairline",
        !last && insetSeparator && (leading ? "hairline-inset" : "hairline-inset-sm"),
        className,
      )}
    >
      {leading}

      <span className={styles.main}>
        <span className={styles.titleRow}>
          <span className={cx(styles.title, (unread || strongTitle) && styles.strong)}>
            {title}
          </span>
          {titleAdornment}
        </span>
        {subtitle && (
          <span className={cx(styles.subtitle, wrapSubtitle && styles.wrap)}>{subtitle}</span>
        )}
        {caption && <span className={styles.caption}>{caption}</span>}
      </span>

      {(meta || trailing) && (
        <span className={styles.side}>
          {meta && <span className={styles.meta}>{meta}</span>}
          {trailing}
        </span>
      )}

      {chevron && <IconChevronRight size={20} className={styles.chevron} />}
    </Comp>
  );
}
