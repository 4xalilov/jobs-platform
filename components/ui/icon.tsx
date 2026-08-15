import { cx } from "@/lib/utils";
import styles from "./icon.module.scss";

/**
 * Barcha ikonkalar chiziqli (outline), 24×24 grid, chiziq qalinligi 1.5px.
 * Faqat faol tab to'ldirilgan (filled) variantga o'tadi — TabIcon ga qarang.
 */
export type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, className, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(styles.icon, className)}
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * To'ldirilgan variant — faqat faol tab uchun.
 * Alohida shakl chiziladi, chunki konturli yo'llarni shunchaki bo'yash
 * ochiq chiziqlarni buzadi.
 */
function SolidIcon({ size = 24, className, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cx(styles.icon, className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconBriefcase = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
    <path d="M3 12h18" />
  </Icon>
);

export const IconMessage = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.5 11.7a8.3 8.3 0 0 1-8.4 8.3 8.5 8.5 0 0 1-3.7-.85L3.5 20.5l1.35-4.8A8.3 8.3 0 0 1 12.1 3.4a8.3 8.3 0 0 1 8.4 8.3Z" />
  </Icon>
);

export const IconBookmark = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 21l-7-5-7 5V5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5V21z" />
  </Icon>
);

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 21v-1.5A4.5 4.5 0 0 0 15.5 15h-7A4.5 4.5 0 0 0 4 19.5V21" />
    <circle cx="12" cy="8" r="4" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Icon>
);

export const IconMic = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Icon>
);

export const IconCamera = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 20H3a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 3 7h3l1.8-2.5h8.4L18 7h3a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 21 20Z" />
    <circle cx="12" cy="13" r="3.8" />
  </Icon>
);

export const IconVideo = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="6" width="13" height="12" rx="2.5" />
    <path d="M15 10.5 22 7v10l-7-3.5" />
  </Icon>
);

export const IconMapPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10.2" r="2.8" />
  </Icon>
);

export const IconNearby = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 3 3 10.5l7.5 3L13.5 21 21 3Z" />
  </Icon>
);

export const IconX = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 6.5 9.5 17 4 11.5" />
  </Icon>
);

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 6h17M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
    <path d="M18.5 6 17.6 19.6A2 2 0 0 1 15.6 21.5H8.4a2 2 0 0 1-2-1.9L5.5 6" />
  </Icon>
);

export const IconMoon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.5 13.4A8.5 8.5 0 1 1 10.6 3.5a6.8 6.8 0 0 0 9.9 9.9Z" />
  </Icon>
);

export const IconSun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.5 12h2M19.5 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4" />
  </Icon>
);

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 12h17" />
    <path d="M12 3a15 15 0 0 1 3.8 9A15 15 0 0 1 12 21a15 15 0 0 1-3.8-9A15 15 0 0 1 12 3Z" />
  </Icon>
);

export const IconClock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 1.9" />
  </Icon>
);

export const IconEye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Icon>
);

export const IconUsers = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 19.5V21" />
    <circle cx="9.5" cy="8" r="3.8" />
    <path d="M21 21v-1.5a4.5 4.5 0 0 0-3.2-4.3M16 4.4a3.8 3.8 0 0 1 0 7.2" />
  </Icon>
);

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
  </Icon>
);

export const IconSend = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21.5 2.5 10.8 13.2M21.5 2.5l-6.8 19-3.9-8.3-8.3-3.9 19-6.8Z" />
  </Icon>
);

export const IconBolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.2 2 4 13.4h7L10.8 22 20 10.6h-7L13.2 2Z" />
  </Icon>
);

export const IconShieldCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21.5s7.5-3.6 7.5-9.3V5.4L12 2.5 4.5 5.4v6.8c0 5.7 7.5 9.3 7.5 9.3Z" />
    <path d="m9 11.8 2.2 2.2 4-4" />
  </Icon>
);

export const IconImage = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <circle cx="8.7" cy="8.7" r="1.7" />
    <path d="m21 15.5-4.6-4.6L5 21" />
  </Icon>
);

export const IconMore = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.3" />
    <circle cx="12" cy="12" r="1.3" />
    <circle cx="19" cy="12" r="1.3" />
  </Icon>
);

export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21.5 16.9v2.8a1.9 1.9 0 0 1-2.1 1.9 18.9 18.9 0 0 1-8.2-2.9 18.6 18.6 0 0 1-5.7-5.7A18.9 18.9 0 0 1 2.6 4.6 1.9 1.9 0 0 1 4.5 2.5h2.8a1.9 1.9 0 0 1 1.9 1.6c.12.9.34 1.8.66 2.7a1.9 1.9 0 0 1-.43 2L8.2 9.9a15.2 15.2 0 0 0 5.7 5.7l1.1-1.2a1.9 1.9 0 0 1 2-.43c.87.32 1.78.54 2.7.66a1.9 1.9 0 0 1 1.6 1.94Z" />
  </Icon>
);

export const IconPencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20.5h9" />
    <path d="M16.6 3.4a2 2 0 0 1 2.9 2.9L7.6 18.2 3.5 19.4l1.2-4.1L16.6 3.4Z" />
  </Icon>
);

export const IconPlay = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 4.2 19 12 6.5 19.8V4.2Z" />
  </Icon>
);

export const IconPause = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4.5v15M15 4.5v15" />
  </Icon>
);

/** Yetkazildi — bitta belgi; o'qildi — ikkita */
export const IconCheckDouble = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.5 12.5 6 17 16.5 6.5M11 15.5l1.5 1.5L23 6.5" />
  </Icon>
);

export const IconSquare = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5.5" y="5.5" width="13" height="13" rx="2" />
  </Icon>
);

export const IconCard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19" />
  </Icon>
);

export const IconSliders = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Icon>
);

/** Arizalarim — yuborilgan arizalar ro'yxati */
export const IconDocument = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Icon>
);

/* ——— Faol tab uchun to'ldirilgan variantlar ——— */

export const IconBriefcaseSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <path d="M9.5 3h5A2.5 2.5 0 0 1 17 5.5V6h3a2 2 0 0 1 2 2v2.5H2V8a2 2 0 0 1 2-2h3v-.5A2.5 2.5 0 0 1 9.5 3Zm0 1.6a.9.9 0 0 0-.9.9V6h6.8v-.5a.9.9 0 0 0-.9-.9h-5ZM2 12.1h20V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.9Z" />
  </SolidIcon>
);

export const IconDocumentSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <path d="M13.6 2H7a2.5 2.5 0 0 0-2.5 2.5v15A2.5 2.5 0 0 0 7 22h10a2.5 2.5 0 0 0 2.5-2.5V7.9L13.6 2Zm-.4 2.9 3.9 3.9h-3.9V4.9ZM9 12.2h6a.8.8 0 0 1 0 1.6H9a.8.8 0 0 1 0-1.6Zm0 3.6h4a.8.8 0 0 1 0 1.6H9a.8.8 0 0 1 0-1.6Z" />
  </SolidIcon>
);

export const IconMessageSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <path d="M12.1 3.4a8.3 8.3 0 0 1 8.4 8.3 8.3 8.3 0 0 1-8.4 8.3 8.5 8.5 0 0 1-3.7-.85l-4.9 1.35 1.35-4.8A8.3 8.3 0 0 1 12.1 3.4Z" />
  </SolidIcon>
);

export const IconUserSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <circle cx="12" cy="8" r="4.2" />
    <path d="M12 14.2c-4 0-7.2 2.4-7.2 5.3 0 .8.6 1.5 1.4 1.5h11.6c.8 0 1.4-.7 1.4-1.5 0-2.9-3.2-5.3-7.2-5.3Z" />
  </SolidIcon>
);

export const IconUsersSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <circle cx="9" cy="8" r="3.9" />
    <path d="M9 13.8c-3.7 0-6.7 2.2-6.7 4.9 0 .8.6 1.4 1.3 1.4h10.8c.7 0 1.3-.6 1.3-1.4 0-2.7-3-4.9-6.7-4.9Z" />
    <path d="M17.2 11.5a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0-1.1.2 5.5 5.5 0 0 1 0 6.2c.35.13.72.2 1.1.2Zm.6 1.6c-.5 0-1 .05-1.45.15 1.3 1.2 2.05 2.75 2.05 4.45 0 .5-.1.95-.3 1.4h3.2c.7 0 1.2-.6 1.2-1.35 0-2.5-2.1-4.65-4.7-4.65Z" />
  </SolidIcon>
);

export const IconCardSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <path d="M4.5 5h15A2.5 2.5 0 0 1 22 7.5V9H2V7.5A2.5 2.5 0 0 1 4.5 5ZM2 10.8h20v5.7a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16.5v-5.7Zm3.2 3.9a.8.8 0 0 0 0 1.6h3.4a.8.8 0 0 0 0-1.6H5.2Z" />
  </SolidIcon>
);

export const IconBookmarkSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <path d="M7.5 2.5h9A2.9 2.9 0 0 1 19.4 5.4v15.4a.9.9 0 0 1-1.42.73L12 17.2l-5.98 4.33a.9.9 0 0 1-1.42-.73V5.4A2.9 2.9 0 0 1 7.5 2.5Z" />
  </SolidIcon>
);

/** Yashirish — oqimda ko'rinmasin */
export const IconEyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6.2 0 10 7 10 7a17 17 0 0 1-3.1 4M6.4 6.5A17 17 0 0 0 2 12s3.8 7 10 7c2 0 3.7-.7 5.1-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icon>
);

export const IconSearchSolid = (p: IconProps) => (
  <SolidIcon {...p}>
    <path d="M11 3a8 8 0 1 0 4.9 14.3l4.4 4.4a1.1 1.1 0 0 0 1.56-1.56l-4.4-4.4A8 8 0 0 0 11 3Zm0 2.2a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6Z" />
  </SolidIcon>
);
