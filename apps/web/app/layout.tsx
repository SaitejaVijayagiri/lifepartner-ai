import type { Metadata } from "next";
import { Inter, Playfair_Display, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import NetworkStatus from '@/components/NetworkStatus';

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const fontMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifePartner AI",
  description: "Find your perfect match with AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifePartner AI",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        {/* Google AdSense - Real ID */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1408290775036355"
          crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
          <NetworkStatus />
          {children}

        </ClientProviders>
      </body>
    </html>
  );
}
