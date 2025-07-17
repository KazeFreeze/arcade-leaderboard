// app/api/get-scores/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// This line forces the route to be rendered dynamically for every request.
// This is the key to ensuring fresh data from the database.
export const dynamic = "force-dynamic";

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

    // While setting headers to prevent caching is good practice,
    // `export const dynamic = "force-dynamic";` is the more modern and
    // reliable way to handle this in the Next.js App Router.
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
