import { cx } from "@/lib/utils";
import styles from "./large-title.module.scss";

/**
 * Sahifa sarlavhasi — 2.125rem / 700 / -0.025em.
 * Asosiy bo'limlar ro'yxatning tepasida shu bilan boshlanadi.
 */
export function LargeTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(styles.header, className)}>
      <h1 className={styles.title}>{children}</h1>
      {action}
    </div>
  );
}
