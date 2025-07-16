// app/api/get-gamemodes/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

// Define a mapping from game ID to a more user-friendly name and an icon
const gameDetails: { [key: string]: { name: string; icon: string } } = {
  'pac-man': { name: 'PAC-MAN', icon: '🟡' },
  'space-invaders': { name: 'SPACE INVADERS', icon: '👾' },
  'tetris': { name: 'TETRIS', icon: '🟩' },
  'asteroids': { name: 'ASTEROIDS', icon: '💫' },
  'frogger': { name: 'FROGGER', icon: '🐸' },
};


export async function GET() {
  try {
    // Fetch distinct gamemodes from the leaderboard
    const { rows } = await sql`
      SELECT DISTINCT gamemode FROM leaderboard;
    `;
    
    // Map the database gamemodes to the format the frontend expects
    const formattedGames = rows.map(row => {
        const details = gameDetails[row.gamemode] || { name: row.gamemode.toUpperCase(), icon: '🕹️' };
        return {
            id: row.gamemode,
            name: details.name,
            icon: details.icon
        }
    });

    return NextResponse.json(formattedGames);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch game modes' }, { status: 500 });
  }
}
