import { cn } from "@/lib/utils";

/**
 * Sahifa sarlavhasi — 34px / 700 / -0.4px.
 * Asosiy bo'limlar ro'yxatning tepasida shu bilan boshlanadi.
 */
export function LargeTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3 bg-bg px-4 pt-3 pb-2", className)}>
      <h1 className="text-large text-fg">{children}</h1>
      {action}
    </div>
  );
}
