import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { BRAND_CONFIG } from "./brandConfig";

export const metadata: Metadata = {
  title: BRAND_CONFIG.fullName,
  description: `Programa de fidelización exclusivo de ${BRAND_CONFIG.name}`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <main className="min-h-screen flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black md:bg-[url('/bg-desktop.png')] md:bg-cover md:bg-center md:bg-fixed">
          <div className="absolute inset-0 bg-black/40 hidden md:block pointer-events-none" />
          <div className="relative z-10 flex-col flex flex-1 w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
