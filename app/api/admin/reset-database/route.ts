// app/api/admin/reset-database/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { resetTable } from "@/lib/db";

// The 'runtime = edge' line has been removed to use the default Node.js runtime.

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // This is now the ONLY check. It verifies the user is logged in
  // via GitHub and their email matches the ADMIN_EMAIL.
  // @ts-ignore
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // The password is no longer needed. We just reset the table.
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
