import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { IntroSplash } from "@/components/intro-splash";
import { SwipeNavigator } from "@/components/swipe-navigator";
import { Toaster } from "@/components/ui/sonner";

import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FantaPWA",
  description: "Fantacalcio Progressive Web App",
  manifest: "/manifest.json",
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
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <IntroSplash />
          <div className="pb-20">
            <SwipeNavigator>
              {children}
            </SwipeNavigator>
          </div>
          <BottomNav />
          <SpeedInsights />
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
