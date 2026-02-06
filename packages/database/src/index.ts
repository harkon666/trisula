import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

// Environment variables are automatically available in Vercel serverless
// For local development, use: bun --env-file=../../.env run dev

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
}

// Global Singleton for HMR/Dev
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

const client = globalForDb.conn ?? postgres(connectionString, {
    prepare: false,
    connect_timeout: 10, // 10 seconds timeout
    ssl: 'require', // Force SSL for Supabase
    debug: (conn: any, msg: any) => {
        if (msg.includes && msg.includes('Error')) {
            console.error('[DB DEBUG] ', msg);
        }
    }
});

if (process.env.NODE_ENV !== "production") {
    globalForDb.conn = client;
    console.log("📦 (Re)using database connection...");
} else {
    console.log("📦 Initializing production database connection...");
}

export const db = drizzle(client, { schema });

export * from "./db/schema";