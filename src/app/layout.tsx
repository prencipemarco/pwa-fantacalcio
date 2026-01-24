import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { SplashScreen } from "@/components/splash-screen";
import { SwipeNavigator } from "@/components/swipe-navigator";

import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fantacalcio",
  description: "App manageriale per il Fantacalcio",
  manifest: "/manifest.json",
};

import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <SplashScreen />
          <div className="pb-20">
            <SwipeNavigator>
              {children}
            </SwipeNavigator>
          </div>
          <BottomNav />
          <SpeedInsights />
        </LanguageProvider>
      </body>
    </html>
  );
}
