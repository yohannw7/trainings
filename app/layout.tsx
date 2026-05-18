import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { BackgroundDecor } from "@/components/BackgroundDecor";

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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0c16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <ModalProvider>
              <BackgroundDecor />
              <SmoothScroll>{children}</SmoothScroll>
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
