import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

// Environment variables are automatically available in Vercel serverless
// For local development, use: bun --env-file=../../.env run dev

let _db: PostgresJsDatabase<typeof schema> | null = null;

export const getDb = () => {
    if (_db) return _db;

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("❌ DATABASE_URL tidak ditemukan di environment variables!");
        throw new Error("DATABASE_URL is not configured");
    }

    console.log("📦 Initializing database connection...");
    const client = postgres(connectionString);
    _db = drizzle(client, { schema });
    return _db;
};

// For backward compatibility - lazy proxy
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
    get(_, prop) {
        return (getDb() as any)[prop];
    }
});

export * from "./db/schema";