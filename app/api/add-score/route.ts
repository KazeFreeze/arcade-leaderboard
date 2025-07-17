// app/api/add-score/route.ts
import { NextResponse } from "next/server";
import { createTable, sql } from "@/lib/db";
import { generateRandomName } from "@/lib/generateName";
import { revalidatePath } from "next/cache";

export const runtime = "edge";

/**
 * This endpoint is called by the physical arcade machine to submit a new score.
 *
 * FIX: The logic has been updated to be more robust.
 * 1.  It now checks if a score is already pending a name.
 * 2.  If a pending score is recent (under 5 minutes old), it rejects the new score with a "409 Conflict" status. This prevents multiple pending scores from conflicting and gives the user time to enter their name.
 * 3.  If a pending score is old (over 5 minutes), it's automatically assigned a random name to clear it, allowing the new score to be processed.
 * 4.  The previous logic that could cause race conditions has been removed.
 */
export async function POST(request: Request) {
  await createTable();

  const { score, gamemode, datetime } = await request.json();

  if (typeof score !== "number" || !gamemode || !datetime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Check if there's already a score pending a name.
    const existingPending = await sql`
      SELECT id, created_at FROM leaderboard WHERE pending_name = TRUE LIMIT 1;
    `;

    if (existingPending.rows.length > 0) {
      const pendingScore = existingPending.rows[0];
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes
      const scoreAge = Date.now() - new Date(pendingScore.created_at).getTime();

      // If the existing pending score is older than 5 minutes, assign it a random name to clear it.
      if (scoreAge > fiveMinutes) {
        const randomName = generateRandomName();
        await sql`
          UPDATE leaderboard
          SET name = ${randomName}, pending_name = FALSE
          WHERE id = ${pendingScore.id};
        `;
        // After clearing the old one, we can proceed to add the new one.
      } else {
        // If a recent pending score already exists, reject the new score for now.
        // This prevents multiple pending scores and gives the user time to enter their name.
        return NextResponse.json(
          {
            message:
              "A score is already pending a name. Please try again shortly.",
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Insert the new score and mark it as pending a name.
    const result = await sql`
      INSERT INTO leaderboard (score, gamemode, datetime, pending_name)
      VALUES (${score}, ${gamemode}, ${datetime}, TRUE)
      RETURNING id;
    `;

    const newScoreId = result.rows[0].id;

    // Revalidate the path to trigger the modal on the client.
    revalidatePath("/");

    return NextResponse.json(
      { message: "Score added successfully", scoreId: newScoreId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to add score" }, { status: 500 });
  }
}
