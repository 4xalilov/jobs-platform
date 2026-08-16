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

  const login = async () => {
    setLoading(true);
    const { next } = await apiPost<{ next: string }>("/auth/dev");
    router.replace(next);
    router.refresh();
  };

  return (
    <>
      <Button block size="lg" loading={loading} onClick={login}>
        {t.auth.devButton}
      </Button>
      <p className={cx(styles.note, styles.noteTight)}>{t.auth.devHint}</p>
    </>
  );
}
