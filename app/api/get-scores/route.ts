// app/api/get-scores/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    // Fetch the top 10 scores, ordered from highest to lowest.
    const { rows } = await sql`
      SELECT id, name, score, gamemode, datetime, pending_name
      FROM leaderboard
      ORDER BY score DESC
      LIMIT 10;
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
