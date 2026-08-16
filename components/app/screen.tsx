"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { IconArrowLeft } from "@/components/ui/icon";
import { useBackNavigation, usePopStateDirection, useScreenTransition } from "@/lib/navigation";
import { cx } from "@/lib/utils";
import styles from "./screen.module.scss";

/**
 * Har ekran shu qobiq ichida (v4, §3 va §5).
 *
 * Panel balandligi 3.5rem va scroll'da o'zgarmaydi — kichrayadigan
 * sarlavha kadr tushishiga sabab bo'ladi va o'lchamni oldindan
 * aytib bo'lmaydigan qiladi. Panel ostidagi chiziq esa faqat scroll
 * boshlangandan keyin chiqadi: tepada turganda ortiqcha chiziq
 * ko'rinmaydi.
 */
export function Screen({
  title,
  subtitle,
  back,
  trailing,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Orqaga tugmasi. `true` — tarixga qaytadi, satr — aniq yo'lga. */
  back?: boolean | string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const goBack = useBackNavigation();
  const direction = useScreenTransition();

  // Brauzerning orqaga tugmasi ham teskari animatsiya bersin
  usePopStateDirection();
  const scrolled = useScrolled();

  return (
    <>
      <header className={cx(styles.bar, scrolled && styles.barScrolled)}>
        <span className={styles.side}>
          {back && (
            <button
              type="button"
              aria-label={t.common.back}
              className={styles.action}
              onClick={() => goBack(typeof back === "string" ? back : undefined)}
            >
              <IconArrowLeft size={24} />
            </button>
          )}
        </span>

        <span className={styles.titleWrap}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>

        <span className={styles.side}>{trailing}</span>
      </header>

      <div className={cx(styles.screen, styles[direction])}>{children}</div>
    </>
  );
}

/**
 * Scroll boshlandimi — panel ostidagi chiziq shunga qarab chiqadi.
 * Brauzer holatini o'qiganimiz uchun useSyncExternalStore: effekt
 * ichida setState qilish ortiqcha render bosqichi beradi.
 */
function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 2,
    () => false,
  );
}
