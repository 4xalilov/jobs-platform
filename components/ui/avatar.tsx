import Image from "next/image";
import { avatarColor, cx, initials } from "@/lib/utils";
import styles from "./avatar.module.scss";

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  /** Tez javob beruvchi ish beruvchi — yashil nuqta */
  online?: boolean;
  className?: string;
};

/** Logo bo'lmasa — nom harfi va nomdan hisoblangan turg'un peer rangi */
export function Avatar({ name, src, size = 48, online = false, className }: AvatarProps) {
  return (
    <span className={cx(styles.avatar, className)} style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt={name} width={size} height={size} className={styles.image} />
      ) : (
        <span
          className={styles.initials}
          style={{ background: avatarColor(name), fontSize: size * 0.38 }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span className={styles.online} style={{ width: size * 0.28, height: size * 0.28 }} />
      )}
    </span>
  );
}
