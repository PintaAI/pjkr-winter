import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: true,
  display: 'swap'
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: true,
  display: 'swap'
});

export const metadata: Metadata = {
  title: "PJKR Winter",
  description: "PJKR Winter Event Registration",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PJKR Winter",
  },
  icons: {
    apple: [
      { url: "/logo.png", sizes: "192x192" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <div>
              {children}
              <Toaster position="top-center" />
              <Analytics />
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
