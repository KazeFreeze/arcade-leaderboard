// app/api/get-pending-score/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ROUTE SEGMENT CONFIG: Force dynamic rendering and disable all caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const runtime = "edge";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT id, score, gamemode, created_at 
      FROM leaderboard 
      WHERE pending_name = TRUE 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    const data = rows.length > 0 ? rows[0] : null;

    // API RESPONSE HEADERS: Explicitly tell browsers and proxies not to cache.
    return NextResponse.json(data, {
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
      { error: "Failed to fetch pending score" },
      { status: 500 }
    );
  }
}
