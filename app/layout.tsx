import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const montserrat = localFont({
  src: '../public/fonts/Montserrat-Regular.ttf',
  variable: "--font-montserrat",
  preload: true,
  display: 'swap'
});

const sinoff = localFont({
  src: '../public/fonts/sinoff.otf',
  variable: "--font-sinoff",
  preload: true,
  display: 'swap'
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "PJKR Winter",
  description: "PJKR Winter Event Registration",
  manifest: "/manifest.json",
  themeColor: "#000000",
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
      <body className={`${montserrat.variable} ${sinoff.variable} font-montserrat antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
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
