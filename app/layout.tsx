import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ThemeInit } from "../.flowbite-react/init";
import ConditionalLayout from "@/app/conditionallayout";
import { Providers } from "./providers";
import AuthProvider from "./authProvider";
import "./globals.css";
import { OrderFilesProvider } from '@/lib/contexts/OrderFilesContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Holixia - Premium DTF Printing Solutions",
  description: "Transform your creative designs into reality with professional DTF printing. Quality, speed, and innovation in every print.",
  keywords: "DTF printing, direct to film, custom printing, design printing, textile printing",
  authors: [{ name: "Holixia" }],
  openGraph: {
    title: "Holixia - Premium DTF Printing Solutions",
    description: "Transform your creative designs into reality with professional DTF printing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <ThemeInit />
        <Providers>
          <AuthProvider>
            <ConditionalLayout>
              <OrderFilesProvider>{children}</OrderFilesProvider>
            </ConditionalLayout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}