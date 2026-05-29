import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccentInitializer } from "@/components/settings/AccentInitializer";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s — ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/icons/icon.svg",
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
    siteName: APP_NAME,
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  keywords: ["карта", "места", "лавочки", "виды", "путешествия", "город", "хобби"],
  authors: [{ name: APP_NAME }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  // Запрещаем браузерный pinch-zoom всего UI — карта Leaflet делает свой
  // pinch-zoom внутри своего контейнера. Иначе пальцами тянется весь
  // интерфейс вместе с картой.
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AccentInitializer />
          {children}
          <Toaster
            position="bottom-center"
            richColors
            expand
            theme="system"
            gap={10}
            // Без крестика и без ручного закрытия — тосты исчезают сами.
            // Отступ над нижней панелью задаётся в globals.css через env()
            // (env() в inline-style на iOS PWA не вычисляется — см. CLAUDE.md).
            toastOptions={{
              dismissible: false,
              style: {
                borderRadius: "16px",
                fontFamily: "var(--font-inter)",
              },
              className: "shadow-xl",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
