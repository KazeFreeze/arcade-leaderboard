import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    // Validate the name input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Sanitize and trim the name
    const sanitizedName = name.trim().slice(0, 20);

    // Find the most recent score that is pending a name update.
    // This ensures that if multiple scores were somehow created without a name,
    // we only update the very last one.
    const pendingScoreResult = await sql`
      SELECT id FROM leaderboard WHERE pending_name = TRUE ORDER BY created_at DESC LIMIT 1;
    `;

    // If no rows are returned, it means no score is currently waiting for a name.
    // This is an expected scenario if the user tries to access this endpoint directly
    // or if their pending score session expired.
    if (pendingScoreResult.rows.length === 0) {
      // Return a 404 Not Found status. The frontend should handle this gracefully.
      return NextResponse.json({ error: 'No score pending a name update' }, { status: 404 });
    }

    const { id } = pendingScoreResult.rows[0];

    // Update the specific score with the new name and set pending_name to false.
    await sql`
      UPDATE leaderboard 
      SET name = ${sanitizedName}, pending_name = FALSE 
      WHERE id = ${id};
    `;

    // Return a success response
    return NextResponse.json({ message: 'Name updated successfully' }, { status: 200 });

  } catch (error) {
    // Log the error for debugging purposes
    console.error('Database Error in /api/update-name:', error);
    // Return a generic 500 Internal Server Error
    return NextResponse.json({ error: 'Failed to update name due to a server error' }, { status: 500 });
  }
}
