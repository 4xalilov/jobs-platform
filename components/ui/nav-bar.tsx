import { cn } from "@/lib/utils";

/** Yuqoridagi sarlavha paneli — sodda, chegara o'rniga ingichka chiziq */
export function NavBar({
  title,
  leading,
  trailing,
  className,
}: {
  title: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative flex h-11 items-center gap-2 bg-surface/95 px-2 backdrop-blur-md",
        "pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <span className="flex min-w-11 items-center justify-start">{leading}</span>
      <h1 className="flex-1 truncate text-center text-title text-text">{title}</h1>
      <span className="flex min-w-11 items-center justify-end">{trailing}</span>
    </header>
  );
}
