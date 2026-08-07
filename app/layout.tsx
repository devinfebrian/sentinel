import type { Metadata } from "next";
import { Inter, Urbanist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Two families by design: Urbanist is a geometric display face that carries the
// headings, Inter handles body/label/table text where it stays legible small.
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

export const metadata: Metadata = {
  title: "Sentinel - AI Financial Analyst",
  description: "Internal enterprise financial intelligence platform",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${urbanist.variable} ${inter.variable} h-full antialiased`}>
      <head>
        {/* Only loaded when Google sign-in is actually switched on. */}
        {googleAuthEnabled && (
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="beforeInteractive"
          />
        )}
      </head>
      {/* Auth state lives in a Zustand store, so no provider is needed here —
          which also keeps Server Components free of a React context they
          could not read anyway. */}
      <body className="min-h-full flex flex-col bg-background font-sans antialiased text-on-surface">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
