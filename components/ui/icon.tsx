import { cn } from "@/lib/utils";

/**
 * Barcha ikonkalar chiziqli (outline) — to'ldirilgan emas.
 * 24×24 grid, stroke 1.8.
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
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
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
