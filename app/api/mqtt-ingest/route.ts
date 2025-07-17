// app/api/mqtt-ingest/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  // 1. Secure the endpoint
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.HIVE_WEBHOOK_SECRET}`;

  if (authHeader !== expectedAuth) {
    console.warn("Unauthorized webhook attempt.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Parse the incoming data from HiveMQ
    const payload = await request.json();

    // The actual message from your ESP32 is in the `payload` property of the webhook body
    const { score, gamemode, datetime } = payload.payload;

    if (typeof score !== "number" || !gamemode) {
      return NextResponse.json(
        { error: "Invalid score data" },
        { status: 400 }
      );
    }

    // 3. Handle the "default" datetime
    const finalDatetime =
      datetime === "default" || !datetime ? new Date().toISOString() : datetime;

    // 4. Insert the score into the database (and mark it as pending a name)
    await sql`
      INSERT INTO leaderboard (score, gamemode, datetime, pending_name)
      VALUES (${score}, ${gamemode}, ${finalDatetime}, TRUE);
    `;

    // 5. Revalidate the cache for the homepage
    // This tells Vercel to fetch fresh data the next time someone loads the page.
    revalidatePath("/");

    return NextResponse.json(
      { message: "Score ingested successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error ingesting MQTT score:", error);
    return NextResponse.json(
      { error: "Failed to process score" },
      { status: 500 }
    );
  }
}
