// app/api/get-gamemodes/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// This line forces the route to be rendered dynamically for every request.
// This ensures that if a new game mode is added, it will appear immediately.
export const dynamic = "force-dynamic";

export const runtime = "edge";

// Define a mapping from game ID to a more user-friendly name and an icon
const gameDetails: { [key: string]: { name: string; icon: string } } = {
  "time-rush": { name: "TIME RUSH", icon: "⌛" },
  reflex: { name: "REFLEX", icon: "🎯" },
  endless: { name: "ENDLESS", icon: "🎮" },
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

    // Return the response with headers that prevent caching.
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
