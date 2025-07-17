// app/layout.tsx
import type { Metadata } from "next";
import { VT323 } from "next/font/google"; // 1. Import the new retro font
import "./globals.css";
import NextAuthProvider from "./components/SessionProvider";
import BackgroundAnimation from "./components/BackgroundAnimation"; // 2. Import the new animation component

// 3. Configure the new font for optimal performance with next/font
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400", // This font only has one weight
  variable: '--font-vt323', // 4. Set it up as a CSS variable
});

export const metadata: Metadata = {
  title: "Laser Target Game Leaderboard",
  description: "High scores from the DIY laser target game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Font <link> tags are no longer needed here, next/font handles it */}
      </head>
      {/* 5. Apply the font variable to the whole app */}
      <body className={`${vt323.variable} font-arcade text-white`}>
        {/* 6. Render the background animation canvas behind the content */}
        <BackgroundAnimation />
        
        {/* 7. Wrap main content to place it on the top layer (z-index: 2) */}
        <main className="main-content">
          <NextAuthProvider>{children}</NextAuthProvider>
        </main>
      </body>
    </html>
  );
}
