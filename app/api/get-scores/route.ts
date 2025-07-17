// app/api/get-scores/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

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
    // FIX: The query has been updated.
    // 1. The `AND name IS NOT NULL` condition has been removed. This ensures that all scores
    //    for the selected gamemode are fetched, including those that are pending a name.
    // 2. `COALESCE(name, 'PENDING...')` is used to ensure the `name` field is never null.
    //    If a score has a null name (because it's pending), it will be displayed as 'PENDING...'.
    //    This prevents the app from breaking and makes it clear a score is awaiting input.
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
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
