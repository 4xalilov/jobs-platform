"use client";

import { IconArrowLeft } from "@/components/ui/icon";
import { NavBar } from "@/components/ui/nav-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/ui/state";
import { cx } from "@/lib/utils";
import styles from "./chat.module.scss";

/**
 * Suhbat yuklanmoqda — panel darhol chiziladi, xabarlar o'rnida chiziq.
 *
 * Boshqa ekranlarda `ScreenLoading` ishlatiladi, lekin chat `Screen`
 * qobig'ida emas (uning o'z paneli va yozish maydoni bor), shuning
 * uchun bu yerda shakl qo'lda takrorlanadi.
 */
export function ChatLoading() {
  return (
    <div className={styles.chat}>
      <NavBar
        className={cx(styles.navBar, "hairline")}
        leading={
          <span className={styles.backButton} aria-hidden="true">
            <IconArrowLeft size={24} />
          </span>
        }
        title={<Skeleton style={{ display: "inline-block", width: "8rem", height: "0.9375rem" }} />}
      />
      <div className={styles.thread}>
        <LoadingState shape="text" rows={1} />
      </div>
      <div className={styles.composer}>
        <div className={styles.composerRow}>
          <Skeleton style={{ flex: 1, height: "2.25rem", borderRadius: "0.5rem" }} />
        </div>
      </div>
    </div>
  );
}
