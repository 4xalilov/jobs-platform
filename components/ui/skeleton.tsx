import { cn } from "@/lib/utils";

/** Yuklanishda spinner emas — skeleton */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("skeleton rounded-md", className)} style={style} aria-hidden="true" />;
}

/** Vakansiya ro'yxati uchun tayyor skeleton qatori */
export function ListItemSkeleton({ last = false }: { last?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 bg-surface px-4 py-2.5",
        !last && "hairline hairline-inset",
      )}
    >
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-[0.9375rem] w-2/5" />
        <Skeleton className="h-[0.8125rem] w-3/5" />
      </div>
      <Skeleton className="h-[0.8125rem] w-8" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <ListItemSkeleton key={i} last={i === rows - 1} />
      ))}
    </div>
  );
}
