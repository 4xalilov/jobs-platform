"use client";

import { useRef } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { IconBellOff, IconPin } from "@/components/ui/icon";
import type { ChannelListItemDTO } from "@/lib/db/types";
import { haptic } from "@/lib/haptics";
import { cx, formatAgo, formatSalaryShort } from "@/lib/utils";
import styles from "./channel-row.module.scss";

/**
 * Kanal qatori. Ikki ko'rinishda ishlaydi:
 *
 * - "Ishlar" tabida (obuna kanallar): o'ngda vaqt va yangi vakansiyalar
 *   belgisi, izoh qatorida oxirgi vakansiya
 * - Katalogda: o'ngda obuna tugmasi, izoh qatorida vakansiya va
 *   obunachi soni
 */
export function ChannelRow({
  channel,
  variant = "feed",
  last = false,
  onOpen,
  onToggleSubscribe,
  onLongPress,
}: {
  channel: ChannelListItemDTO;
  variant?: "feed" | "catalog";
  last?: boolean;
  onOpen: (channel: ChannelListItemDTO) => void;
  onToggleSubscribe?: (channel: ChannelListItemDTO) => void;
  onLongPress?: (channel: ChannelListItemDTO) => void;
}) {
  const { t, locale } = useI18n();
  const name = channel.name[locale];

  // Uzoq bosish — kontekst menyusi (§1.2). Sichqoncha o'ng tugmasi ham.
  const press = useLongPress(() => onLongPress?.(channel));

  return (
    <div
      className={cx(styles.row, !last && "hairline hairline-inset")}
      {...(variant === "feed" ? press : {})}
    >
      <button type="button" onClick={() => onOpen(channel)} className={styles.hit}>
        <Avatar name={name} />
        <span className={styles.main}>
          <span className={styles.titleLine}>
            <span className={styles.title}>{name}</span>
            {channel.muted && (
              <span className={styles.muted}>
                <IconBellOff size={15} />
              </span>
            )}
            {channel.pinned && (
              <span className={styles.pinned}>
                <IconPin size={15} />
              </span>
            )}
            {variant === "feed" && channel.last && (
              <span className={styles.time}>{formatAgo(channel.last.minutesAgo, t.time)}</span>
            )}
          </span>

          {variant === "feed" ? (
            <span className={styles.preview}>
              <span className={styles.previewText}>
                {channel.last
                  ? `${channel.last.title} — ${channel.last.company}`
                  : t.channels.emptyChannel}
              </span>
              {channel.last && (channel.last.salaryMin || channel.last.salaryMax) && (
                <span className={styles.salary}>
                  {formatSalaryShort(
                    channel.last.salaryMin,
                    channel.last.salaryMax,
                    t.job.millionShort,
                    "",
                    t.job.negotiable,
                  ).trim()}
                </span>
              )}
              {channel.newCount > 0 && (
                <span className={cx(styles.badge, channel.muted && styles.badgeMuted)}>
                  {channel.newCount > 99 ? "99+" : channel.newCount}
                </span>
              )}
            </span>
          ) : (
            <span className={styles.counts}>
              {[
                t.channels.vacancies.replace("{count}", String(channel.vacancyCount)),
                t.channels.subscribers.replace("{count}", String(channel.subscriberCount)),
              ].join(" · ")}
            </span>
          )}
        </span>
      </button>

      {variant === "catalog" && onToggleSubscribe && (
        <button
          type="button"
          onClick={() => {
            haptic("select");
            onToggleSubscribe(channel);
          }}
          className={cx(styles.subscribe, channel.subscribed && styles.subscribed)}
        >
          {channel.subscribed ? t.channels.subscribed : t.channels.subscribe}
        </button>
      )}
    </div>
  );
}

/**
 * Uzoq bosish (500ms) va sichqonchaning o'ng tugmasi.
 * Taymer ref da — oddiy o'zgaruvchi har render da qayta yaratilib,
 * bekor qilish ishlamay qolardi.
 */
function useLongPress(onTrigger: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    timer.current = setTimeout(onTrigger, 500);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (event: React.MouseEvent) => {
      event.preventDefault();
      onTrigger();
    },
  };
}
