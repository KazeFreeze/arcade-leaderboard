// app/api/get-pending-score/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// This line forces the route to be rendered dynamically for every request.
// This is critical for the modal to pop up as soon as a new score is submitted.
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

    // If a pending score is found, return its details.
    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      // If no score is pending, return null.
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending score" },
      { status: 500 }
    );
  }
}
