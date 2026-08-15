import { cx } from "@/lib/utils";
import styles from "./empty-state.module.scss";

/** Bo'sh ro'yxat holati — chiziqli ikonka, sarlavha, bitta izoh */
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(styles.empty, className)}>
      <span className={styles.icon}>{icon}</span>
      <p className={styles.title}>{title}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
