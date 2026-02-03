import dotenv from 'dotenv';
import { join } from 'path';

// Load .env dari root monorepo
dotenv.config({ path: join(import.meta.dir, '../../../.env') });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("❌ DATABASE_URL tidak ditemukan di environment variables!");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// JANGAN panggil fungsi main() di sini!
export * from "./db/schema";