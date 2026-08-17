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

/**
 * Skeletning shakli — qaysi qator taqlid qilinayotgani.
 *
 * Ilovada beshta turli geometriyali qator bor va har birining
 * balandligi boshqacha. Bitta umumiy skelet ishlatilsa kontent
 * kelganda layout sakraydi (CLS), shuning uchun har shaklning
 * balandligi haqiqiy qator bilan bir xil qilingan:
 *
 *   list     — ikki qatorli element, avatar + vaqt   (4.75rem)
 *   channel  — kanal qatori, o'ngda yumaloq belgi    (4.75rem)
 *   vacancy  — to'rt qatorli vakansiya elementi      (6rem)
 *   card     — ariza kartochkasi: sarlavha + zanjir  (ajratilgan)
 *   text     — oddiy matn bloki, qator foni yo'q
 */
export type SkeletonShape = "list" | "channel" | "vacancy" | "card" | "text";

/** Vakansiya ro'yxati uchun tayyor skeleton qatori */
export function ListItemSkeleton({
  last = false,
  shape = "list",
}: {
  last?: boolean;
  shape?: SkeletonShape;
}) {
  if (shape === "text") {
    return (
      <div className={styles.text}>
        <Skeleton className={styles.textLineWide} />
        <Skeleton className={styles.textLine} />
        <Skeleton className={styles.textLineShort} />
      </div>
    );
  }

  if (shape === "card") {
    return (
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <Skeleton className={styles.avatar} />
          <div className={styles.lines}>
            <Skeleton className={styles.lineTitle} />
            <Skeleton className={styles.lineSubtitle} />
          </div>
        </div>
        <div className={styles.cardChain}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className={styles.chainStep} />
          ))}
        </div>
      </div>
    );
  }

  if (shape === "vacancy") {
    return (
      <div className={cx(styles.row, styles.rowVacancy, !last && "hairline hairline-inset")}>
        <Skeleton className={styles.avatar} />
        <div className={styles.lines}>
          <Skeleton className={styles.lineTitle} />
          <Skeleton className={styles.lineSubtitle} />
          <Skeleton className={styles.lineSalary} />
          <Skeleton className={styles.lineStats} />
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.row, !last && "hairline hairline-inset")}>
      <Skeleton className={styles.avatar} />
      <div className={styles.lines}>
        <Skeleton className={styles.lineTitle} />
        <Skeleton className={styles.lineSubtitle} />
      </div>
      <Skeleton className={shape === "channel" ? styles.badge : styles.meta} />
    </div>
  );
}

export function ListSkeleton({
  rows = 4,
  shape = "list",
}: {
  rows?: number;
  shape?: SkeletonShape;
}) {
  return (
    <div className={shape === "card" ? styles.cardList : undefined}>
      {Array.from({ length: rows }, (_, i) => (
        <ListItemSkeleton key={i} last={i === rows - 1} shape={shape} />
      ))}
    </div>
  );
}
