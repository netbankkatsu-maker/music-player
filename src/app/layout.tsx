import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Manrope } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Music Player",
  description: "YouTube Music Player - モダンなミュージックプレイヤー",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Music Player",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${manrope.variable}`}>
      <body
        className="h-dvh overflow-hidden"
        style={{ fontFamily: "'Noto Sans JP', 'Manrope', sans-serif" }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
