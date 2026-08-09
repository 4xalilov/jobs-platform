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
 * Ro'yxat elementini chapga tortganda tez harakatlar chiqadi (saqlash, o'chirish).
 * Vertikal skrollga xalaqit bermaydi — faqat gorizontal harakat ushlanadi.
 */
export function SwipeListItem({
  actions,
  children,
  className,
}: {
  actions: SwipeAction[];
  children: React.ReactNode;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"none" | "x" | "y">("none");

  const maxOffset = actions.length * ACTION_WIDTH;

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

    const base = offset;
    const next = base - dx;
    // Chegaradan tashqarida qarshilik (rubber band)
    const clamped =
      next < 0 ? next * 0.25 : next > maxOffset ? maxOffset + (next - maxOffset) * 0.25 : next;
    setOffset(clamped);
  };

  const finish = () => {
    if (axis.current === "x") {
      setOffset(offset > maxOffset / 2 ? maxOffset : 0);
    }
    setDragging(false);
    start.current = null;
    axis.current = "none";
  };

  const runAction = (action: SwipeAction) => {
    action.onAction();
    setOffset(0);
  };

  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => runAction(action)}
            style={{ width: ACTION_WIDTH }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-white",
              "text-[11px] leading-[13px] font-medium",
              action.className,
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        style={{
          transform: `translateX(${-Math.max(0, offset)}px)`,
          transition: dragging ? "none" : "transform 0.22s var(--ease-tg)",
        }}
        className="relative touch-pan-y bg-surface"
      >
        {children}
      </div>
    </div>
  );
}
