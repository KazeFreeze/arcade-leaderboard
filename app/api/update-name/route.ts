// app/api/update-name/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { name, scoreId } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (typeof scoreId === "undefined" || scoreId === null) {
      return NextResponse.json(
        { error: "Score ID is required" },
        { status: 400 }
      );
    }

    const sanitizedName = name.trim().slice(0, 20);

    // Update the specific score and set pending_name to false.
    const { rows } = await sql`
      UPDATE leaderboard
      SET name = ${sanitizedName}, pending_name = FALSE
      WHERE id = ${scoreId}
      RETURNING *;
    `;

    // Revalidate the path to ensure the leaderboard updates across all clients.
    revalidatePath("/");

    // Return a success response with the updated score data.
    return NextResponse.json(
      { message: "Name updated successfully", score: rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database Error in /api/update-name:", error);
    return NextResponse.json(
      { error: "Failed to update name due to a server error" },
      { status: 500 }
    );
  }
}
