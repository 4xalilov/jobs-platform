import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ThemeProvider, themeInitScript } from "@/components/providers/theme-provider";
import shell from "@/components/app/shell.module.scss";
import themes from "@/styles/themes.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ish top",
  description: "O'zbekiston uchun ish topish platformasi",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ish top" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  /* Qiymat themes.json dan olinadi — qo'lda yozilsa palitra
     o'zgarganda brauzer paneli eski rangda qolib ketardi */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themes.light.surface.base },
    { media: "(prefers-color-scheme: dark)", color: themes.dark.surface.base },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz-Latn" suppressHydrationWarning>
      <head>
        {/* Brauzer ham ikkala temani biladi — fon va boshqaruv elementlari
            React yuklanishidan oldin to'g'ri chiziladi */}
        <meta name="color-scheme" content="light dark" />
        {/* Tungi rejimda oq chaqnash bo'lmasligi uchun — chizishdan oldin ishlaydi */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={shell.body}>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
        {/* Barcha menyu, sheet va modal shu ildizga render qilinadi */}
        <div id="portals" />
      </body>
    </html>
  );
}
