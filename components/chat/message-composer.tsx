"use client";

import { useRef, useState } from "react";
import { formatDuration } from "@/components/chat/voice-bubble";
import { useI18n } from "@/components/providers/i18n-provider";
import { IconMic, IconSend, IconSquare, IconX } from "@/components/ui/icon";
import { useRecorder } from "@/lib/use-recorder";
import { cn } from "@/lib/utils";

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
    <div className="sticky bottom-0 z-10 border-t border-separator bg-surface px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
      {notice && (
        <button
          type="button"
          onClick={recorder.dismiss}
          className="mb-2 flex w-full items-center justify-between gap-2 rounded-tg-sm bg-fill px-3 py-2 text-left"
        >
          <span className="text-caption text-text-secondary">{notice}</span>
          <IconX size={16} className="text-text-tertiary" />
        </button>
      )}

      {recorder.state === "recording" ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t.screens.chat.cancelRecording}
            onClick={recorder.cancel}
            className="p-2 text-text-secondary"
          >
            <IconX size={22} />
          </button>

          <div className="flex h-9 flex-1 items-center gap-2 rounded-tg-sm bg-fill px-3">
            <span className="size-2 animate-pulse rounded-full bg-danger" />
            <span className="text-body text-text">{t.screens.chat.recording}</span>
            <span className="ml-auto text-body tabular-nums text-text-secondary">
              {formatDuration(recorder.elapsedMs)}
            </span>
          </div>

          <button
            type="button"
            aria-label={t.common.send}
            onClick={recorder.stop}
            className="p-2 text-accent"
          >
            <IconSquare size={24} />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
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
            className={cn(
              "max-h-[120px] min-h-9 flex-1 resize-none rounded-tg-sm bg-fill px-3 py-1.5",
              "text-body text-text placeholder:text-text-tertiary focus:outline-none",
            )}
          />

          {hasText ? (
            <button
              type="button"
              aria-label={t.common.send}
              onClick={submit}
              className="p-2 text-accent"
            >
              <IconSend size={24} />
            </button>
          ) : (
            <button
              type="button"
              aria-label={t.screens.chat.voiceMessage}
              onClick={() => void recorder.start()}
              className="p-2 text-text-secondary"
            >
              <IconMic size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
