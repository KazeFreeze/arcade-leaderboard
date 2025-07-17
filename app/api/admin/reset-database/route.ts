// app/api/admin/reset-database/route.ts
import { NextResponse } from "next/server";
import { resetTable } from "@/lib/db";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Authenticate the request
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset the database table
    await resetTable();

    return NextResponse.json({ message: "Database reset successfully" });
  } catch (error) {
    console.error("Database Reset Error:", error);
    return NextResponse.json(
      { error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
