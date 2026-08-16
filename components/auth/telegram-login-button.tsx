"use client";

import { useEffect, useRef } from "react";
import styles from "./auth.module.scss";

/**
 * Telegram Login Widget.
 *
 * Widget o'zining iframe'ini skript orqali qo'yadi, shuning uchun uni
 * React ichida ref'ga qo'lda joylashtiramiz. Bosilgach Telegram
 * `data-auth-url` manziliga imzolangan parametrlar bilan qaytaradi.
 */
export function TelegramLoginButton({ botUsername }: { botUsername: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-auth-url", `${window.location.origin}/api/auth/telegram`);
    script.setAttribute("data-request-access", "write");
    node.appendChild(script);

    return () => {
      node.replaceChildren();
    };
  }, [botUsername]);

  return <div ref={container} className={styles.widget} />;
}
