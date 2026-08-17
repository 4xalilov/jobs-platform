"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { IconBriefcase } from "@/components/ui/icon";
import type { SkeletonShape } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import styles from "./state-lab.module.scss";

/**
 * Uch holatning sinov maydoni (v5, B2).
 *
 * Nega kerak: skelet balandligi haqiqiy qator bilan mos kelmasa
 * kontent kelganda ro'yxat sakraydi, lekin buni faqat yonma-yon
 * qo'yib ko'rish mumkin. Bu yerda har shakl tanlanadi va darhol
 * ko'rinadi — o'lchagichsiz tekshirishning eng tez yo'li.
 */
const SHAPES: SkeletonShape[] = ["list", "channel", "vacancy", "card", "text"];

export function StateLab() {
  const { t } = useI18n();
  const [shape, setShape] = useState<SkeletonShape>("vacancy");

  return (
    <div className={styles.lab}>
      <Segmented
        label={t.design.states.shape}
        options={SHAPES.map((value) => ({ value, label: value }))}
        value={shape}
        onChange={setShape}
      />

      <div className={styles.frame}>
        <LoadingState shape={shape} rows={shape === "card" ? 2 : 3} />
      </div>

      <div className={styles.frame}>
        <EmptyState
          icon={<IconBriefcase size={44} />}
          title={t.channels.emptyChannel}
          hint={t.channels.emptyChannelHint}
          action={<Button variant="secondary">{t.channels.browse}</Button>}
        />
      </div>

      <div className={styles.frame}>
        <ErrorState
          reason={t.design.states.sampleReason}
          onRetry={() => {
            /* Sinov maydonida qayta urinish uchun so'rov yo'q */
          }}
        />
      </div>
    </div>
  );
}
