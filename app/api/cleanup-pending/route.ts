// app/api/cleanup-pending/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateRandomName } from "@/lib/generateName";
import { revalidatePath } from "next/cache";

export const runtime = "edge";

/**
 * This endpoint is responsible for cleaning up expired pending scores.
 * It's called by the frontend on page load to ensure the database is tidy.
 */
export async function POST() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Find all scores that are still pending and were created more than 5 minutes ago.
    const { rows: expiredScores } = await sql`
      SELECT id FROM leaderboard 
      WHERE pending_name = TRUE AND created_at < ${fiveMinutesAgo};
    `;

    if (expiredScores.length === 0) {
      return NextResponse.json({ message: "No expired scores to clean up." });
    }

    // Assign a random name to each expired score.
    for (const score of expiredScores) {
      const randomName = generateRandomName();
      await sql`
        UPDATE leaderboard
        SET name = ${randomName}, pending_name = FALSE
        WHERE id = ${score.id};
      `;
    }

    // Revalidate the homepage to ensure all clients see the updated leaderboard.
    revalidatePath("/");

    return NextResponse.json({
      message: `Cleaned up ${expiredScores.length} expired scores.`,
    });
  } catch (error) {
    console.error("Cleanup Error:", error);
    return NextResponse.json(
      { error: "Failed to clean up pending scores" },
      { status: 500 }
    );
  }
}
