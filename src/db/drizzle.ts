import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

// Create a Drizzle ORM instance
export const db = drizzle(client);
