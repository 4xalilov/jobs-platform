"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { DevLoginButton } from "@/components/auth/dev-login-button";
import { TelegramLoginButton } from "@/components/auth/telegram-login-button";
import { IconBriefcase } from "@/components/ui/icon";

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
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-bg px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-on-accent">
          <IconBriefcase size={34} />
        </span>
        <h1 className="mt-5 text-[28px] leading-8 font-semibold text-text">{t.auth.title}</h1>
        <p className="mt-2 text-body text-text-secondary">{t.auth.subtitle}</p>

        {error && (
          <div className="mt-5 w-full rounded-tg bg-danger/10 px-4 py-3">
            <p className="text-body font-medium text-danger">{t.auth.error}</p>
            <p className="mt-0.5 text-caption text-text-secondary">{t.auth.errorHint}</p>
          </div>
        )}
      </div>

      <div className="pb-[calc(32px+env(safe-area-inset-bottom))]">
        {configured && botUsername ? (
          <>
            <TelegramLoginButton botUsername={botUsername} />
            <p className="mt-3 text-center text-caption text-text-tertiary">{t.auth.privacy}</p>
          </>
        ) : devLoginAllowed ? (
          <DevLoginButton />
        ) : (
          <div className="rounded-tg bg-fill px-4 py-3 text-center">
            <p className="text-body text-text">{t.auth.notConfigured}</p>
            <p className="mt-1 text-caption text-text-secondary">{t.auth.notConfiguredHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
