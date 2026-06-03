import type { Metadata } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MusicProvider } from "@/components/music-provider";
import { LightsOut } from "@/components/lights-out";
import { FavouriteHighlighter } from "@/components/favourite-highlighter";
import { BottomNav } from "@/components/bottom-nav";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Pit Wall — Formula 1 Dashboard",
  description:
    "An editorial Formula 1 dashboard: live countdown, 2026 standings, full calendar, and a stats archive back to 1950.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink pb-14 md:pb-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MusicProvider>
            <LightsOut />
            <FavouriteHighlighter />
            <PullToRefresh />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <BottomNav />
          </MusicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
