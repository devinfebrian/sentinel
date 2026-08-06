import type { Metadata } from "next";
<<<<<<< HEAD
import { Urbanist, Inter } from "next/font/google";
=======
import { Urbanist } from "next/font/google";
>>>>>>> 57e293e424e509af77e287fc22a49551929540a5
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

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

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Sentinel - Financial Intelligence",
  description: "Sentinel AI financial intelligence and risk analysis platform",
=======
  title: "Sentinel - AI Financial Analyst",
  description: "Internal enterprise financial intelligence platform",
>>>>>>> 57e293e424e509af77e287fc22a49551929540a5
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className={`${urbanist.variable} ${inter.variable} h-full antialiased`}>
=======
    <html lang="en" className={`${urbanist.variable} h-full antialiased`}>
>>>>>>> 57e293e424e509af77e287fc22a49551929540a5
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
<<<<<<< HEAD
      <body className="min-h-full flex flex-col bg-[#f6fbf6] font-sans antialiased text-on-surface">
=======
      <body className="min-h-full flex flex-col bg-background font-sans antialiased text-on-surface">
>>>>>>> 57e293e424e509af77e287fc22a49551929540a5
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
