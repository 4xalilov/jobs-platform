"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "denied" | "unsupported";

/** Chatdagi ovozli xabar uchun chegara */
export const MAX_RECORDING_MS = 60_000;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Mikrofonga bosiladi — yozuv boshlanadi, yana bosiladi — yuboriladi.
 * Ushlab turish emas, chunki tasodifiy qo'yib yuborish xabarni yo'qotadi.
 */
export function useRecorder(onDone: (blob: Blob, durationMs: number) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const cancelled = useRef(false);
  const finish = useRef(onDone);

  useEffect(() => {
    finish.current = onDone;
  }, [onDone]);

  const stopTracks = useCallback(() => {
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    recorder.current = null;
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !pickMimeType()) {
      setState("unsupported");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("denied");
      return;
    }

    const mimeType = pickMimeType();
    const instance = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    cancelled.current = false;
    startedAt.current = Date.now();

    instance.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    instance.onstop = () => {
      const durationMs = Date.now() - startedAt.current;
      const blob = new Blob(chunks.current, { type: instance.mimeType || "audio/webm" });
      stopTracks();
      setState("idle");
      setElapsedMs(0);
      // Tasodifan bosilgan bo'lsa yubormaymiz
      if (!cancelled.current && blob.size > 0 && durationMs >= 400) {
        finish.current(blob, durationMs);
      }
    };

    recorder.current = instance;
    instance.start();
    setElapsedMs(0);
    setState("recording");
  }, [stopTracks]);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    stop();
  }, [stop]);

  // Sanagich va uzunlik chegarasi
  useEffect(() => {
    if (state !== "recording") return;

    const timer = setInterval(() => {
      const passed = Date.now() - startedAt.current;
      setElapsedMs(passed);
      if (passed >= MAX_RECORDING_MS) stop();
    }, 200);

    return () => clearInterval(timer);
  }, [state, stop]);

  // Ekrandan chiqilsa mikrofon ochiq qolmasin
  useEffect(() => stopTracks, [stopTracks]);

  const dismiss = useCallback(() => setState("idle"), []);

  return { state, elapsedMs, start, stop, cancel, dismiss };
}
