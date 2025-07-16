// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        {/* The Orbitron font is now imported in globals.css */}
      </head>
      {/* Apply the arcade theme background and font to the body */}
      <body className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-orbitron text-white">
        {/* Animated background elements from the example */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-grid">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse-slow"></div>
            <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-pink-500/10 rounded-full blur-xl animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 right-1/2 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
