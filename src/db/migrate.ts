# Database Migration Script
# Run this with: bun run migrate

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import 'dotenv/config';

// Log each migration that's executed for easier debugging
console.log('Running database migrations...');

// Don't do this in production, use environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Migrate the database
async function main() {
  const connection = postgres(connectionString);
  const db = drizzle(connection);

  console.log('Starting migration...');

  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
