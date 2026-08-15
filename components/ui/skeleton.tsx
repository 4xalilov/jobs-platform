import { cx } from "@/lib/utils";
import styles from "./skeleton.module.scss";

/** Yuklanishda spinner emas — skeleton, haqiqiy kontent shakli takrorlanadi */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cx("skeleton", styles.block, className)} style={style} aria-hidden="true" />
  );
}

/** Vakansiya ro'yxati uchun tayyor skeleton qatori */
export function ListItemSkeleton({ last = false }: { last?: boolean }) {
  return (
    <div className={cx(styles.row, !last && "hairline hairline-inset")}>
      <Skeleton className={styles.avatar} />
      <div className={styles.lines}>
        <Skeleton className={styles.lineTitle} />
        <Skeleton className={styles.lineSubtitle} />
      </div>
      <Skeleton className={styles.meta} />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <ListItemSkeleton key={i} last={i === rows - 1} />
      ))}
    </div>
  );
}
