import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

// The hand-lettered face used on the Haven bulletin.
const uhbee = localFont({
  src: [
    { path: "../fonts/UhBeeDongKyung-Regular.woff2", weight: "400" },
    { path: "../fonts/UhBeeDongKyung-Bold.woff2", weight: "700" },
  ],
  variable: "--font-uhbee",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Haven 저녁 조 뽑기",
  description: "헤이븐 예배 후 함께 저녁 먹을 조를 랜덤으로 정해요.",
};

export const viewport: Viewport = {
  themeColor: "#fffdf8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} ${uhbee.variable}`}>
      <body className="text-foreground antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
