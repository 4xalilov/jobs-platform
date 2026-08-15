import { cx } from "@/lib/utils";
import styles from "./nav-bar.module.scss";

/** Yuqoridagi sarlavha paneli — sodda, chegara o'rniga ingichka chiziq */
export function NavBar({
  title,
  leading,
  trailing,
  className,
}: {
  title: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cx(styles.bar, className)}>
      <span className={cx(styles.side, styles.leading)}>{leading}</span>
      <h1 className={styles.title}>{title}</h1>
      <span className={cx(styles.side, styles.trailing)}>{trailing}</span>
    </header>
  );
}
