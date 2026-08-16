"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { DevLoginButton } from "@/components/auth/dev-login-button";
import { TelegramLoginButton } from "@/components/auth/telegram-login-button";
import { IconBriefcase } from "@/components/ui/icon";
import styles from "./auth.module.scss";

/** Kirish ekrani — parol ham, email ham yo'q */
export function LoginScreen({
  botUsername,
  configured,
  devLoginAllowed,
  error,
}: {
  botUsername: string | null;
  configured: boolean;
  devLoginAllowed: boolean;
  error: string | null;
}) {
  const { t } = useI18n();

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <span className={styles.logo}>
          <IconBriefcase size={34} />
        </span>
        <h1 className={styles.title}>{t.auth.title}</h1>
        <p className={styles.subtitle}>{t.auth.subtitle}</p>

        {error && (
          <div className={styles.error}>
            <p className={styles.errorTitle}>{t.auth.error}</p>
            <p className={styles.errorHint}>{t.auth.errorHint}</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {configured && botUsername ? (
          <>
            <TelegramLoginButton botUsername={botUsername} />
            <p className={styles.note}>{t.auth.privacy}</p>
          </>
        ) : devLoginAllowed ? (
          <DevLoginButton />
        ) : (
          <div className={styles.notConfigured}>
            <p className={styles.notConfiguredTitle}>{t.auth.notConfigured}</p>
            <p className={styles.notConfiguredHint}>{t.auth.notConfiguredHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
