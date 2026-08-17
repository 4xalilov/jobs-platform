"use client";

import { useRef, useState } from "react";
import { formatDuration } from "@/components/chat/voice-bubble";
import { useI18n } from "@/components/providers/i18n-provider";
import { IconMic, IconSend, IconSquare, IconX } from "@/components/ui/icon";
import { haptic } from "@/lib/haptics";
import { useRecorder } from "@/lib/use-recorder";
import styles from "./chat.module.scss";

/** Yozish paneli — matn yoki ovoz */
export function MessageComposer({
  onSend,
}: {
  onSend: (draft: { text?: string; blob?: Blob; durationMs?: number }) => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);

  const recorder = useRecorder((blob, durationMs) => onSend({ blob, durationMs }));
  const hasText = text.trim().length > 0;

  const submit = () => {
    if (!hasText) return;
    haptic("select");
    onSend({ text });
    setText("");
    // Bir necha qatorga o'sgan maydon qayta bir qatorga qaytadi
    if (field.current) field.current.style.height = "auto";
    field.current?.focus();
  };

  const notice =
    recorder.state === "denied"
      ? t.screens.chat.micDenied
      : recorder.state === "unsupported"
        ? t.screens.chat.micUnavailable
        : null;

  return (
    <div className={styles.composer}>
      {notice && (
        <button type="button" onClick={recorder.dismiss} className={styles.notice}>
          <span className={styles.noticeText}>{notice}</span>
          <IconX size={16} className={styles.noticeClose} />
        </button>
      )}

      {recorder.state === "recording" ? (
        <div className={styles.recordingRow}>
          <button
            type="button"
            aria-label={t.screens.chat.cancelRecording}
            onClick={recorder.cancel}
            className={styles.iconButton}
          >
            <IconX size={22} />
          </button>

          <div className={styles.recordingBar}>
            <span className={styles.recordingDot} />
            <span className={styles.recordingLabel}>{t.screens.chat.recording}</span>
            <span className={styles.recordingTime}>{formatDuration(recorder.elapsedMs)}</span>
          </div>

          <button
            type="button"
            aria-label={t.common.send}
            onClick={recorder.stop}
            className={styles.iconButtonAccent}
          >
            <IconSquare size={24} />
          </button>
        </div>
      ) : (
        <div className={styles.composerRow}>
          <textarea
            ref={field}
            rows={1}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              const element = event.currentTarget;
              element.style.height = "auto";
              element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
            }}
            onKeyDown={(event) => {
              // Telefonda Enter — yangi qator; klaviaturada Enter — yuborish
              if (event.key === "Enter" && !event.shiftKey && !/Mobi/i.test(navigator.userAgent)) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={t.screens.chat.placeholder}
            aria-label={t.screens.chat.placeholder}
            className={styles.field}
          />

          {hasText ? (
            <button
              type="button"
              aria-label={t.common.send}
              onClick={submit}
              className={styles.iconButtonAccent}
            >
              <IconSend size={24} />
            </button>
          ) : (
            <button
              type="button"
              aria-label={t.screens.chat.voiceMessage}
              onClick={() => void recorder.start()}
              className={styles.iconButton}
            >
              <IconMic size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
