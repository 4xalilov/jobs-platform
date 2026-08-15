"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/client-store";
import { cn } from "@/lib/utils";

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Pastda qoladigan doimiy harakat (masalan "Ariza yuborish") */
  footer?: React.ReactNode;
  /** Fon tugmasi uchun ekran o'quvchi matni — tarjima faylidan keladi */
  closeLabel: string;
  className?: string;
};

/**
 * Modal oyna emas — pastdan ko'tariladigan sheet.
 * Yuqorida tortish uchun dastak, pastga tortilsa yopiladi.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  closeLabel,
  className,
}: SheetProps) {
  const isClient = useIsClient();
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!isClient || !open) return null;

  const close = () => {
    setDragY(0);
    onClose();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };

  const onPointerUp = () => {
    startY.current = null;
    if (dragY > 90) close();
    else setDragY(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={close}
        className="animate-fade-in absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={(node) => {
          node?.focus();
        }}
        className={cn(
          "animate-sheet-up relative max-h-[88vh] overflow-hidden rounded-t-sheet bg-surface-elevated outline-none",
          className,
        )}
        style={
          dragY
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : { transition: "transform 0.22s var(--ease-tg)" }
        }
      >
        {/* Tortish uchun dastak */}
        <div
          className="flex cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="h-1 w-9 rounded-full bg-text-tertiary/50" />
        </div>

        {title && (
          <div className="relative px-4 pt-1 pb-3">
            <h3 className="text-nav text-fg">{title}</h3>
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="border-t border-separator bg-surface-elevated px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    // Barcha qatlam bitta ildizda — ota elementning overflow yoki
    // z-index i ularni hech qachon kesmaydi
    document.getElementById("portals") ?? document.body,
  );
}
