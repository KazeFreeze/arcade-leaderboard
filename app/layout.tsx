// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "Arcade Legends Leaderboard",
  description: "High scores from the arcade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Using Google Fonts via next/font, so no direct link tags needed unless for other fonts */}
      </head>
      <body className={`${inter.className} h-full text-white`}>
        {children}
      </body>
    </html>
  );
}
