// app/api/get-gamemodes/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ROUTE SEGMENT CONFIG: Force dynamic rendering and disable all caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const runtime = "edge";

const gameDetails: { [key: string]: { name: string; icon: string } } = {
  "time-rush": { name: "TIME RUSH", icon: "⌛" },
  reflex: { name: "REFLEX", icon: "🎯" },
  endless: { name: "ENDLESS", icon: "🎮" },
  asteroids: { name: "ASTEROIDS", icon: "💫" },
  frogger: { name: "FROGGER", icon: "🐸" },
};

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT DISTINCT gamemode FROM leaderboard WHERE gamemode IS NOT NULL;
    `;

    const formattedGames = rows.map((row) => {
      const fallbackName = row.gamemode
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
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

    // API RESPONSE HEADERS: Explicitly tell browsers and proxies not to cache.
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
