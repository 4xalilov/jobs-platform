"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/client-store";
import { useFocusTrap } from "@/lib/use-focus-trap";
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
  const drag = useRef<{ startY: number; lastY: number; lastAt: number; velocity: number } | null>(
    null,
  );
  const panel = useRef<HTMLDivElement | null>(null);

  /* Tab ichkarida qamaladi, yopilganda fokus ochgan tugmaga qaytadi */
  useFocusTrap(panel, open);

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
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, lastY: e.clientY, lastAt: e.timeStamp, velocity: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = drag.current;
    if (!state) return;

    // Tezlik px/ms da — oxirgi ikki nuqta orasidan
    const dt = e.timeStamp - state.lastAt;
    if (dt > 0) state.velocity = (e.clientY - state.lastY) / dt;
    state.lastY = e.clientY;
    state.lastAt = e.timeStamp;

    setDragY(Math.max(0, e.clientY - state.startY));
  };

  /*
   * Yopish qarori ikki mezondan biri bilan (§5.4):
   *  - sheet balandligining yarmidan ko'p tortilgan bo'lsa
   *  - yoki tez pastga otilgan bo'lsa (0.5 px/ms dan tez)
   * Faqat masofaga qarasak, tez qilingan qisqa harakat yopmaydi va
   * bu qo'lga sun'iy tuyuladi.
   */
  const onPointerUp = () => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;

    const height = panel.current?.getBoundingClientRect().height ?? 400;
    const flung = state.velocity > 0.5;
    if (flung || dragY > height / 2) close();
    else setDragY(0);
  };

  return createPortal(
    <div className={styles.layer}>
      <button type="button" aria-label={closeLabel} onClick={close} className={styles.backdrop} />

      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={panel}
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
