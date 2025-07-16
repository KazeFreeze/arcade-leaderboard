// app/update-name/route.ts
import { NextResponse } from 'next/server';
import { sql } from '../../lib/db';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    // Find the score that is currently pending a name.
    const pendingScore = await sql`
      SELECT id FROM leaderboard WHERE pending_name = TRUE ORDER BY created_at DESC LIMIT 1;
    `;

    if (pendingScore.rows.length === 0) {
      return NextResponse.json({ message: 'No score is pending a name update.' }, { status: 404 });
    }

    const scoreId = pendingScore.rows[0].id;

    // Update the name and clear the pending flag.
    await sql`
      UPDATE leaderboard
      SET name = ${name}, pending_name = FALSE
      WHERE id = ${scoreId};
    `;
    
    // Revalidate the path to reflect the name change on the leaderboard.
    revalidatePath('/');

    return NextResponse.json({ message: 'Name updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
  }
}
