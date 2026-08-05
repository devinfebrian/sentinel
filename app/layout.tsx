import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

export const metadata: Metadata = {
  title: "Sentinel - AI Financial Analyst",
  description: "Internal enterprise financial intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
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
        {children}
      </body>
    </html>
  );
}
