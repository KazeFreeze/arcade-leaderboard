// lib/db.ts
import { sql } from '@vercel/postgres';

// This function creates the table if it doesn't exist.
export async function createTable() {
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

// This new function will drop the existing table and create a new one.
export async function resetTable() {
  await sql`DROP TABLE IF EXISTS leaderboard;`;
  await createTable();
}


export { sql };
