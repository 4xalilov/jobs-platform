"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { ChannelRow } from "@/components/channels/channel-row";
import { EmptyState } from "@/components/ui/empty-state";
import {
  IconBellOff,
  IconBriefcase,
  IconChevronRight,
  IconPin,
  IconSearch,
  IconX,
} from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { apiPost } from "@/lib/api";
import type { ChannelListItemDTO } from "@/lib/db/types";
import { cx } from "@/lib/utils";
import { useSheet } from "@/lib/use-sheet";
import styles from "./channel-list.module.scss";

/**
 * "Ishlar" tabi — obuna bo'lingan kanallar ro'yxati (v4, §1.2).
 *
 * Tartib serverdan keladi: qadalganlar tepada, keyin oxirgi vakansiya
 * vaqti bo'yicha. Ya'ni yangi vakansiya kelgan kanal o'z-o'zidan
 * ro'yxat tepasiga ko'tariladi.
 */
export function ChannelList({ initial }: { initial: ChannelListItemDTO[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [channels, setChannels] = useState(initial);
  const menu = useSheet<ChannelListItemDTO>();

  const open = (channel: ChannelListItemDTO) => {
    // Belgi darhol yo'qoladi — server javobini kutmaydi
    setChannels((prev) => prev.map((c) => (c.id === channel.id ? { ...c, newCount: 0 } : c)));
    void apiPost(`/channels/${channel.id}/seen`, {});
    router.push(`/jobs/${channel.id}`);
  };

  /** Optimistik: holat darhol o'zgaradi, so'rov fonda ketadi */
  const patch = (id: string, next: Partial<ChannelListItemDTO>) => {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...next } : c)));
  };

  const toggleMuted = (channel: ChannelListItemDTO) => {
    patch(channel.id, { muted: !channel.muted });
    void apiPost(`/channels/${channel.id}/flags`, { muted: !channel.muted });
    menu.close();
  };

  const togglePinned = (channel: ChannelListItemDTO) => {
    const pinned = !channel.pinned;
    patch(channel.id, { pinned });
    void apiPost(`/channels/${channel.id}/flags`, { pinned });
    // Qadalgan kanal tepaga chiqadi — tartib serverdagi bilan bir xil bo'lsin
    setChannels((prev) => {
      const sorted = [...prev];
      sorted.sort((a, b) => Number(b.pinned) - Number(a.pinned));
      return sorted;
    });
    menu.close();
  };

  const unsubscribe = (channel: ChannelListItemDTO) => {
    setChannels((prev) => prev.filter((c) => c.id !== channel.id));
    void apiPost(`/channels/${channel.id}/subscribe`, {});
    menu.close();
  };

  return (
    <>
      <div className={styles.group}>
        <button
          type="button"
          onClick={() => router.push("/jobs/katalog")}
          className={cx(styles.browse, "hairline hairline-inset")}
        >
          <span className={styles.browseIcon}>
            <IconSearch size={22} />
          </span>
          <span className={styles.browseText}>{t.channels.browse}</span>
          <span className={styles.chevron}>
            <IconChevronRight size={20} />
          </span>
        </button>

        {channels.map((channel, index) => (
          <ChannelRow
            key={channel.id}
            channel={channel}
            last={index === channels.length - 1}
            onOpen={open}
            onLongPress={menu.open}
          />
        ))}
      </div>

      {channels.length === 0 && (
        <EmptyState
          icon={<IconBriefcase size={44} />}
          title={t.channels.empty}
          hint={t.channels.emptyHint}
        />
      )}

      <Sheet
        open={menu.isOpen}
        onClose={menu.close}
        closeLabel={t.common.close}
        title={menu.value?.name[locale]}
      >
        {menu.value && (
          <div className={styles.menu}>
            <button
              type="button"
              onClick={() => toggleMuted(menu.value!)}
              className={cx(styles.menuItem, "hairline hairline-inset-sm")}
            >
              <span className={styles.menuIcon}>
                <IconBellOff size={20} />
              </span>
              {menu.value.muted ? t.channels.unmute : t.channels.mute}
            </button>
            <button
              type="button"
              onClick={() => togglePinned(menu.value!)}
              className={cx(styles.menuItem, "hairline hairline-inset-sm")}
            >
              <span className={styles.menuIcon}>
                <IconPin size={20} />
              </span>
              {menu.value.pinned ? t.channels.unpin : t.channels.pin}
            </button>
            <button
              type="button"
              onClick={() => unsubscribe(menu.value!)}
              className={cx(styles.menuItem, styles.menuDanger)}
            >
              <span className={styles.menuIcon}>
                <IconX size={20} />
              </span>
              {t.channels.unsubscribe}
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}
