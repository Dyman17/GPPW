import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be configured");

// Reuse a bounded PostgreSQL pool for the lifetime of the Render web service.
const globalForDb = globalThis as typeof globalThis & { gppwPgPool?: Pool };
const pool = globalForDb.gppwPgPool ?? new Pool({ connectionString, max: 5 });
globalForDb.gppwPgPool = pool;

export const db = drizzle(pool, { schema });
export const migrateDb = (migrationsFolder: string) => migrate(db, { migrationsFolder });
export const closeDb = () => pool.end();
export type Database = typeof db;
