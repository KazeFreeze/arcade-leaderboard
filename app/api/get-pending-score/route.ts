// app/api/get-pending-score/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// This line forces the route to be rendered dynamically for every request.
export const dynamic = "force-dynamic";

export const runtime = "edge";

/**
 * This endpoint checks for a score that is pending a name assignment.
 * It's polled by the frontend to see if the name input modal should be displayed.
 */
export async function GET() {
  try {
    // Find the latest score that has the 'pending_name' flag set to true.
    const { rows } = await sql`
      SELECT id, score, gamemode, created_at 
      FROM leaderboard 
      WHERE pending_name = TRUE 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    const data = rows.length > 0 ? rows[0] : null;

    // Return the response with headers that explicitly prevent any caching.
    // This is a more robust way to ensure data is always fresh.
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
