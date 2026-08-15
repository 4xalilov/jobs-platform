"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { ChannelRow } from "@/components/channels/channel-row";
import type { ChannelGroupDTO, ChannelListItemDTO } from "@/lib/db/types";
import { apiPost } from "@/lib/api";
import styles from "./channel-catalog.module.scss";

type GroupKey = keyof ReturnType<typeof useI18n>["t"]["channels"]["groups"];

/**
 * Katalog — barcha kanallar, kasb guruhlari bo'yicha (v4, §1.2).
 *
 * 5 tadan kam vakansiyasi bor kanal bu yerga umuman kelmaydi (serverda
 * filtrlanadi): bo'sh kanal o'lik mahsulot taassurotini beradi.
 */
export function ChannelCatalog({ initial }: { initial: ChannelGroupDTO[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [groups, setGroups] = useState(initial);

  /** Obuna darhol o'zgaradi, so'rov fonda ketadi */
  const toggle = (channel: ChannelListItemDTO) => {
    const subscribed = !channel.subscribed;
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        channels: group.channels.map((c) =>
          c.id === channel.id
            ? {
                ...c,
                subscribed,
                subscriberCount: c.subscriberCount + (subscribed ? 1 : -1),
              }
            : c,
        ),
      })),
    );
    void apiPost(`/channels/${channel.id}/subscribe`, {});
  };

  const groupName = (id: string) => t.channels.groups[id as GroupKey] ?? id;

  return (
    <>
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className={styles.groupHeader}>{groupName(group.id)}</h2>
          <div className={styles.group}>
            {group.channels.map((channel, index) => (
              <ChannelRow
                key={channel.id}
                channel={channel}
                variant="catalog"
                last={index === group.channels.length - 1}
                onOpen={(c) => router.push(`/jobs/${c.id}`)}
                onToggleSubscribe={toggle}
              />
            ))}
          </div>
        </section>
      ))}

      <p className={styles.footer}>
        {t.channels.catalogFooter.replace(
          "{count}",
          String(
            groups.reduce(
              (sum, group) => sum + group.channels.reduce((n, c) => n + c.vacancyCount, 0),
              0,
            ),
          ),
        )}
      </p>
    </>
  );
}
