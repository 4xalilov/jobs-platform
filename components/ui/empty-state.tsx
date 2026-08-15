import { cn } from "@/lib/utils";

/** Bo'sh ro'yxat holati — chiziqli ikonka, sarlavha, bitta izoh */
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-10 pt-24 text-center", className)}>
      <span className="text-fg-tertiary">{icon}</span>
      <p className="mt-3 text-nav text-fg">{title}</p>
      {hint && <p className="mt-1 text-body text-fg-secondary">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
