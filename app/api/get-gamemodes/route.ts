// app/api/get-gamemodes/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "edge";

// Define a mapping from game ID to a more user-friendly name and an icon
const gameDetails: { [key: string]: { name: string; icon: string } } = {
  "pac-man": { name: "PAC-MAN", icon: "🟡" },
  "space-invaders": { name: "SPACE INVADERS", icon: "👾" },
  tetris: { name: "TETRIS", icon: "🟩" },
  asteroids: { name: "ASTEROIDS", icon: "💫" },
  frogger: { name: "FROGGER", icon: "🐸" },
};

export async function GET() {
  try {
    // Fetch distinct gamemodes from the leaderboard
    const { rows } = await sql`
      SELECT DISTINCT gamemode FROM leaderboard WHERE gamemode IS NOT NULL;
    `;

    const formattedGames = rows.map((row) => {
      const fallbackName = row.gamemode
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const details = gameDetails[row.gamemode] || {
        name: fallbackName,
        icon: "🕹️",
      };

      return {
        id: row.gamemode,
        name: details.name,
        icon: details.icon,
      };
    });

    // FIX: Return the response with headers that prevent caching.
    // This tells Vercel's Edge Network and the browser to always fetch
    // a fresh list of gamemodes and not use a cached version.
    return NextResponse.json(formattedGames, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Database Error in get-gamemodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch game modes" },
      { status: 500 }
    );
  }
}
