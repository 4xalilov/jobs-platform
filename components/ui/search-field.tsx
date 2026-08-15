"use client";

import { cx } from "@/lib/utils";
import { IconSearch, IconX } from "./icon";
import styles from "./search-field.module.scss";

/** Qidiruv maydoni — yuqorida turadi, pastga tortilganda ko'rinadi */
export function SearchField({
  value,
  onValueChange,
  placeholder,
  clearLabel,
  autoFocus,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.shell}>
        <IconSearch size={18} className={styles.icon} />
        <input
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={styles.input}
        />
        {value && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onValueChange("")}
            className={styles.clear}
          >
            <IconX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Ro'yxat tepasidagi qidiruv — bosilganda qidiruv ekraniga o'tadi.
 * Maydonga o'xshaydi, lekin klaviatura ochilmaydi.
 */
export function SearchFieldButton({
  placeholder,
  onClick,
  className,
}: {
  placeholder: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div className={cx(styles.wrap, className)}>
      <button type="button" onClick={onClick} className={styles.shell}>
        <IconSearch size={18} className={styles.icon} />
        <span className={styles.placeholder}>{placeholder}</span>
      </button>
    </div>
  );
}
