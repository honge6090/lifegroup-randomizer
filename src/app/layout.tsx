import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

// Same typeface as NSC Preflight.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Life Group Bungae",
  description: "Sign up and get sorted into a life group.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
