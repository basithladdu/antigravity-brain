import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from "next/font/google";

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANTIGRAVITY",
  description: "Minimalist Monochrome Log Explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}

