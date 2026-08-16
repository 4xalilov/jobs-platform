"use client";

import { useEffect, useRef, useState } from "react";
import { IconPause, IconPlay } from "@/components/ui/icon";
import { cx } from "@/lib/utils";
import styles from "./chat.module.scss";

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Ovozli xabar. To'lqin chizig'i o'rniga oddiy chiziq — chunki haqiqiy
 * to'lqinni chizish uchun butun faylni oldindan yuklab, dekodlash kerak
 * bo'lardi, bu sekin internetda qimmatga tushadi.
 */
export function VoiceBubble({
  url,
  durationMs,
  mine,
  label,
}: {
  url: string;
  durationMs?: number;
  mine: boolean;
  label: string;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);

  useEffect(() => {
    const element = audio.current;
    if (!element) return;

    const onTime = () => setPositionMs(element.currentTime * 1000);
    const onEnd = () => {
      setPlaying(false);
      setPositionMs(0);
    };

    element.addEventListener("timeupdate", onTime);
    element.addEventListener("ended", onEnd);
    element.addEventListener("pause", () => setPlaying(false));
    element.addEventListener("play", () => setPlaying(true));

    return () => {
      element.removeEventListener("timeupdate", onTime);
      element.removeEventListener("ended", onEnd);
    };
  }, []);

  const total = durationMs ?? 0;
  const progress = total > 0 ? Math.min(100, (positionMs / total) * 100) : 0;

  return (
    <div className={styles.voice}>
      <button
        type="button"
        aria-label={label}
        onClick={() => {
          const element = audio.current;
          if (!element) return;
          if (element.paused) void element.play();
          else element.pause();
        }}
        className={cx(styles.play, mine && styles.playMine)}
      >
        {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
      </button>

      <div className={styles.voiceBody}>
        <div className={cx(styles.trackBase, mine && styles.trackBaseMine)}>
          <div
            className={cx(styles.trackFill, mine && styles.trackFillMine)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cx(styles.voiceTime, mine && styles.voiceTimeMine)}>
          {formatDuration(playing || positionMs > 0 ? total - positionMs : total)}
        </span>
      </div>

      <audio ref={audio} src={url} preload="none" />
    </div>
  );
}
