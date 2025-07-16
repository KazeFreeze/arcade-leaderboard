// app/api/add-score/route.ts
import { NextResponse } from 'next/server';
import { createTable, sql } from '@/lib/db';
import { generateRandomName } from '@/lib/generateName';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

// This function simulates an MQTT trigger.
// In a real-world scenario, you'd use a service like Vercel's Cron Jobs
// or a third-party MQTT bridge to call this endpoint.
export async function POST(request: Request) {
  await createTable();

  const { score, gamemode, datetime } = await request.json();

  if (typeof score !== 'number' || !gamemode || !datetime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Before adding a new score, check for any previous score that is still pending a name.
    const pendingScore = await sql`
      SELECT id, created_at FROM leaderboard WHERE pending_name = TRUE ORDER BY created_at DESC LIMIT 1;
    `;

    if (pendingScore.rows.length > 0) {
      const oldScore = pendingScore.rows[0];
      const thirtyMinutes = 30 * 60 * 1000;
      const scoreAge = Date.now() - new Date(oldScore.created_at).getTime();

      // If more than 30 minutes have passed, assign a random name.
      if (scoreAge > thirtyMinutes) {
        const randomName = generateRandomName();
        await sql`
          UPDATE leaderboard
          SET name = ${randomName}, pending_name = FALSE
          WHERE id = ${oldScore.id};
        `;
      }
    }
    
    // Reset any other pending flags before setting a new one.
    await sql`UPDATE leaderboard SET pending_name = FALSE WHERE pending_name = TRUE;`;

    // Insert the new score and mark it as pending a name.
    await sql`
      INSERT INTO leaderboard (score, gamemode, datetime, pending_name)
      VALUES (${score}, ${gamemode}, ${datetime}, TRUE);
    `;

    // Revalidate the homepage path to show the new score immediately.
    revalidatePath('/');

    return NextResponse.json({ message: 'Score added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to add score' }, { status: 500 });
  }
}
