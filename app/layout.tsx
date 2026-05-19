import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PWARegister } from "@/components/PWARegister";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "ASH TRAIN — Workout tracker",
  description: "Personal workout tracker with timers, calculators and progress history",
  applicationName: "ASH Train",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "ASH Train",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BASE_PATH}/favicon-16.png`, sizes: "16x16", type: "image/png" },
      { url: `${BASE_PATH}/icon.svg`, type: "image/svg+xml" },
    ],
    apple: [{ url: `${BASE_PATH}/apple-touch-icon.png`, sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0c16",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body>
        <LocaleProvider>
          <ThemeProvider>
            <ToastProvider>
              <ModalProvider>
                <PWARegister />
                <BackgroundDecor />
                <SmoothScroll>{children}</SmoothScroll>
              </ModalProvider>
            </ToastProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
