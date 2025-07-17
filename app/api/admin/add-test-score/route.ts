// app/api/admin/add-test-score/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

// The 'runtime = edge' line has been removed to use the default Node.js runtime.

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // This is now the ONLY check.
  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We no longer get the password from the request body.
    const { name, score, gamemode } = await request.json();

    if (!name || typeof score !== "number" || !gamemode) {
      return NextResponse.json(
        { error: "Missing required fields: name, score, gamemode" },
        { status: 400 }
      );
    }

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
