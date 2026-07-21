import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fly with Ram — Playwright Test Automation Playground",
  description:
    "A deliberately complex flight-booking playground built for Playwright Mastery Academy. Book flights with intentional edge cases: network intercepts, time control, stubs & spies, shadow DOM, conditional testing, plus classic auto-waiting, iframes, file uploads, dynamic data, visual regressions, a11y violations, and XSS.",
  keywords: [
    "Fly with Ram",
    "Playwright",
    "Test Automation",
    "QA",
    "Flight Booking",
    "Next.js",
    "TypeScript",
    "shadcn/ui",
  ],
  authors: [{ name: "Playwright Mastery Academy" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="fwr_theme"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
