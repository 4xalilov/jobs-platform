import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ThemeProvider, themeInitScript } from "@/components/providers/theme-provider";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#181818" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz-Latn" suppressHydrationWarning>
      <head>
        {/* Tungi rejimda oq chaqnash bo'lmasligi uchun — chizishdan oldin ishlaydi */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
        {/* Barcha menyu, sheet va modal shu ildizga render qilinadi */}
        <div id="portals" />
      </body>
    </html>
  );
}
