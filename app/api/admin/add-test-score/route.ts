// app/api/admin/add-test-score/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { password, name, score, gamemode } = await request.json();

    // Authenticate the request
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!name || typeof score !== "number" || !gamemode) {
      return NextResponse.json(
        { error: "Missing required fields: name, score, gamemode" },
        { status: 400 }
      );
    }

    // Insert the test score into the database
    // We set a current timestamp for datetime and created_at, and pending_name is false
    await sql`
      INSERT INTO leaderboard (name, score, gamemode, datetime, pending_name, created_at)
      VALUES (${name}, ${score}, ${gamemode}, NOW(), FALSE, NOW());
    `;

    return NextResponse.json({ message: "Test score added successfully" });
  } catch (error) {
    console.error("Add Test Score Error:", error);
    return NextResponse.json(
      { error: "Failed to add test score" },
      { status: 500 }
    );
  }
}
