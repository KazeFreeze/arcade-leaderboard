// app/api/get-scores/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ROUTE SEGMENT CONFIG: Force dynamic rendering and disable all caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gamemode = searchParams.get("gamemode");

  if (!gamemode) {
    return NextResponse.json(
      { error: "Game mode is required" },
      { status: 400 }
    );
  }

  try {
    const { rows } = await sql`
      SELECT 
        id, 
        COALESCE(name, 'PENDING...') AS name,
        score, 
        gamemode, 
        datetime
      FROM leaderboard
      WHERE gamemode = ${gamemode}
      ORDER BY score DESC
      LIMIT 10;
    `;

    // API RESPONSE HEADERS: Explicitly tell browsers and proxies not to cache.
    return NextResponse.json(rows, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
