// app/api/update-name/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { name, scoreId } = await request.json(); // Destructure scoreId

    // Validate the name input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate scoreId input
    if (typeof scoreId === 'undefined' || scoreId === null) {
      return NextResponse.json({ error: 'Score ID is required' }, { status: 400 });
    }

    // Sanitize and trim the name
    const sanitizedName = name.trim().slice(0, 20);

    // Update the specific score with the new name and set pending_name to false.
    // Use the provided scoreId directly.
    await sql`
      UPDATE leaderboard
      SET name = ${sanitizedName}, pending_name = FALSE
      WHERE id = ${scoreId};
    `;

    // Revalidate the path to reflect the name change on the leaderboard.
    revalidatePath('/');

    // Return a success response
    return NextResponse.json({ message: 'Name updated successfully' }, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Database Error in /api/update-name:', error);
    // Return a generic 500 Internal Server Error
    return NextResponse.json({ error: 'Failed to update name due to a server error' }, { status: 500 });
  }
}
