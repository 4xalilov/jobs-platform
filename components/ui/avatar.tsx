import Image from "next/image";
import { avatarColor, cn, initials } from "@/lib/utils";

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  /** Tez javob beruvchi ish beruvchi — yashil nuqta */
  online?: boolean;
  className?: string;
};

/** Logo bo'lmasa — nom harfi va nomdan hisoblangan turg'un rang */
export function Avatar({ name, src, size = 48, online = false, className }: AvatarProps) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="size-full rounded-full object-cover"
        />
      ) : (
        <span
          className="flex size-full items-center justify-center rounded-full font-medium text-white select-none"
          style={{ background: avatarColor(name), fontSize: size * 0.38 }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span
          className="absolute right-0 bottom-0 rounded-full border-2 border-surface bg-success"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </span>
  );
}
