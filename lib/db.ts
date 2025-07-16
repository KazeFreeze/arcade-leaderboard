// lib/db.ts
import { sql } from '@vercel/postgres';

export async function createTable() {
  // Creates the leaderboard table if it doesn't exist.
  // The name can be null until it's assigned.
  // A 'pending_name' flag is used to identify the score waiting for a name.
  // 'created_at' stores the timestamp of the score.
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      score INT NOT NULL,
      gamemode VARCHAR(50) NOT NULL,
      datetime TIMESTAMPTZ NOT NULL,
      pending_name BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

export { sql };
