import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";

export type Database = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var _postgresClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var _drizzleDb: Database | undefined;
}

export function getDb(): Database | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!globalThis._drizzleDb) {
    const client = globalThis._postgresClient ?? postgres(connectionString, { max: 1, prepare: false });
    globalThis._postgresClient = client;
    globalThis._drizzleDb = drizzle(client, { schema });
  }
  return globalThis._drizzleDb;
}

export async function closeDb() {
  if (globalThis._postgresClient) {
    await globalThis._postgresClient.end();
  }
  globalThis._postgresClient = undefined;
  globalThis._drizzleDb = undefined;
}
