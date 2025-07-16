// app/api/get-scores/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gamemode = searchParams.get('gamemode');

  if (!gamemode) {
    return NextResponse.json({ error: 'Game mode is required' }, { status: 400 });
  }

  try {
    // Fetch the top 10 scores for a specific gamemode
    const { rows } = await sql`
      SELECT id, name, score
      FROM leaderboard
      WHERE gamemode = ${gamemode} AND name IS NOT NULL
      ORDER BY score DESC
      LIMIT 10;
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
