import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";

export type Database = PostgresJsDatabase<typeof schema>;
let database: Database | null = null;
let client: ReturnType<typeof postgres> | null = null;

export function getDb(): Database | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!database) {
    client = postgres(connectionString, { max: 1, prepare: false });
    database = drizzle(client, { schema });
  }
  return database;
}

export async function closeDb() {
  if (client) await client.end();
  client = null;
  database = null;
}
