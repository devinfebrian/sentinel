import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Eleva - K-12 Learning Portal",
  description: "Eleva K-12 Learning Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
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
      <body className="min-h-full flex flex-col bg-[#B9D9EB] font-sans antialiased text-on-surface">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

