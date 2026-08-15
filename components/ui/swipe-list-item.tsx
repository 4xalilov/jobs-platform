"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SwipeAction = {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** Fon rangi (Tailwind sinfi) */
  className: string;
  onAction: () => void;
};

const ACTION_WIDTH = 76;

/**
 * Ro'yxat elementini tortganda tez harakatlar chiqadi.
 * Chapga tortilsa o'ngdagi harakatlar, o'ngga tortilsa chapdagilar.
 * Vertikal skrollga xalaqit bermaydi — faqat gorizontal harakat ushlanadi.
 */
export function SwipeListItem({
  actions,
  leadingActions,
  children,
  className,
}: {
  /** Chapga tortilganda — o'ng tomonda chiqadi */
  actions?: SwipeAction[];
  /** O'ngga tortilganda — chap tomonda chiqadi */
  leadingActions?: SwipeAction[];
  children: React.ReactNode;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"none" | "x" | "y">("none");
  // Tortishdan keyingi "click" qator ustidagi harakatni ishga tushirmasin
  const suppressClick = useRef(false);

  const trailing = actions ?? [];
  const leading = leadingActions ?? [];
  const maxTrailing = trailing.length * ACTION_WIDTH;
  const maxLeading = leading.length * ACTION_WIDTH;

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = "none";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (axis.current === "none") {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "x") setDragging(true);
    }
    if (axis.current !== "x") return;

    // Musbat — chapga tortilgan, manfiy — o'ngga
    const next = offset - dx;
    const upper = maxTrailing;
    const lower = -maxLeading;
    // Chegaradan tashqarida qarshilik (rubber band)
    const clamped =
      next > upper
        ? upper + (next - upper) * 0.25
        : next < lower
          ? lower + (next - lower) * 0.25
          : next;
    setOffset(clamped);
  };

  const finish = () => {
    if (axis.current === "x") {
      suppressClick.current = true;
      if (offset > maxTrailing / 2) setOffset(maxTrailing);
      else if (offset < -maxLeading / 2) setOffset(-maxLeading);
      else setOffset(0);
    }
    setDragging(false);
    start.current = null;
    axis.current = "none";
  };

  /**
   * Tortish tugagach brauzer baribir "click" yuboradi — u qatorni ochib
   * yuborardi. Harakatlar ochiq turganda ham birinchi bosish ularni yopadi.
   */
  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (offset !== 0) {
      e.preventDefault();
      e.stopPropagation();
      setOffset(0);
    }
  };

  const runAction = (action: SwipeAction) => {
    action.onAction();
    setOffset(0);
  };

  const renderActions = (list: SwipeAction[], side: "left" | "right") => (
    <div className={cn("absolute inset-y-0 flex", side === "right" ? "right-0" : "left-0")}>
      {list.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => runAction(action)}
          style={{ width: ACTION_WIDTH }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-white",
            "text-[0.6875rem] leading-[0.8125rem] font-medium",
            action.className,
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      {leading.length > 0 && renderActions(leading, "left")}
      {trailing.length > 0 && renderActions(trailing, "right")}

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onClickCapture={onClickCapture}
        style={{
          transform: `translateX(${-offset}px)`,
          transition: dragging ? "none" : "transform 0.22s var(--ease-tg)",
        }}
        className="relative touch-pan-y bg-surface"
      >
        {children}
      </div>
    </div>
  );
}
