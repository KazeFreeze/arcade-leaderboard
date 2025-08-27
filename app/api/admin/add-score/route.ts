// app/api/admin/add-score/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache"; // Import revalidatePath

/**
 * This endpoint is called by the admin page to add a score.
 *
 * FIX: Added `revalidatePath`.
 * When a score was added, the server's cache for the leaderboard page wasn't being cleared.
 * This meant you wouldn't see the new score until the cache expired or the page was manually refreshed.
 * Calling `revalidatePath('/')` tells Next.js to immediately refetch the data for the homepage,
 * ensuring the leaderboard is always up-to-date after you add a score.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Revalidate the homepage path to ensure the leaderboard updates
    revalidatePath("/");

    return NextResponse.json({ message: "Score added successfully" });
  } catch (error) {
    console.error("Add Score Error:", error);
    return NextResponse.json(
      { error: "Failed to add score" },
      { status: 500 }
    );
  }
}
