// app/layout.tsx
import type { Metadata } from "next";
import { Orbitron } from "next/font/google"; // Changed to Orbitron for the arcade theme
import "./globals.css";

// Setup the Orbitron font using next/font for better performance
const orbitron = Orbitron({ 
  subsets: ["latin"], 
  display: 'swap',
  weight: ['400', '700', '900'] // Specify weights used in the project
});

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
      <head />
      {/* Applied the Orbitron font class to the body for consistent styling */}
      <body className={`${orbitron.className} h-full text-white`}>
        {children}
      </body>
    </html>
  );
}
