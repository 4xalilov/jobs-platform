"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/client-store";
import { cx } from "@/lib/utils";
import styles from "./sheet.module.scss";

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
    <div className={styles.layer}>
      <button type="button" aria-label={closeLabel} onClick={close} className={styles.backdrop} />

      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={(node) => {
          node?.focus();
        }}
        className={cx(styles.panel, className)}
        style={
          dragY
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : { transition: "transform 0.22s cubic-bezier(0.33, 1, 0.68, 1)" }
        }
      >
        {/* Tortish uchun dastak */}
        <div
          className={styles.grabber}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className={styles.grabberBar} />
        </div>

        {title && (
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    // Barcha qatlam bitta ildizda — ota elementning overflow yoki
    // z-index i ularni hech qachon kesmaydi
    document.getElementById("portals") ?? document.body,
  );
}
