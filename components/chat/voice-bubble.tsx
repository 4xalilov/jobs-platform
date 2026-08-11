"use client";

import { useEffect, useRef, useState } from "react";
import { IconPause, IconPlay } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        aria-label={label}
        onClick={() => {
          const element = audio.current;
          if (!element) return;
          if (element.paused) void element.play();
          else element.pause();
        }}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          mine ? "bg-on-accent/20 text-on-accent" : "bg-accent text-on-accent",
        )}
      >
        {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
      </button>

      <div className="min-w-[104px] flex-1">
        <div className={cn("h-1 rounded-full", mine ? "bg-on-accent/30" : "bg-fill")}>
          <div
            className={cn("h-1 rounded-full", mine ? "bg-on-accent" : "bg-accent")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          className={cn(
            "mt-1 block text-[11px] leading-[13px]",
            mine ? "text-on-accent/70" : "text-text-tertiary",
          )}
        >
          {formatDuration(playing || positionMs > 0 ? total - positionMs : total)}
        </span>
      </div>

      <audio ref={audio} src={url} preload="none" />
    </div>
  );
}
