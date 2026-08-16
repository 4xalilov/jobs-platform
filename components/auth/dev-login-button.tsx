"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { cx } from "@/lib/utils";
import styles from "./auth.module.scss";

/** Telegram boti sozlanmaganda mahalliy sinov uchun kirish */
export function DevLoginButton() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Xato ushlanadi va ekranda ko'rsatiladi. Ilgari u ushlanmasdi —
   * baza ko'tarilmagan bo'lsa tugma jim qotib qolardi va sabab faqat
   * brauzer konsolida ko'rinardi, ya'ni odam uni umuman ko'rmasdi.
   */
  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const { next } = await apiPost<{ next: string }>("/auth/dev");
      router.replace(next);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setLoading(false);
    }
  };

  return (
    <>
      <Button block size="lg" loading={loading} onClick={login}>
        {t.auth.devButton}
      </Button>
      <p className={cx(styles.note, styles.noteTight)}>{t.auth.devHint}</p>
      {error && (
        <div className={styles.error}>
          <p className={styles.errorTitle}>{t.auth.error}</p>
          <p className={styles.errorHint}>{error}</p>
        </div>
      )}
    </>
  );
}
