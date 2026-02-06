import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

// Environment variables are automatically available in Vercel serverless
// For local development, use: bun --env-file=../../.env run dev

let _db: any = null;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (!_db) {
            console.log("📦 Initializing database connection (Lazy)...");
            const connectionString = process.env.DATABASE_URL;
            if (!connectionString) {
                throw new Error("DATABASE_URL is not configured");
            }
            const client = postgres(connectionString, {
                prepare: false,
                connect_timeout: 10,
                ssl: 'require',
            });
            _db = drizzle(client, { schema });
        }
        return Reflect.get(_db, prop);
    }
}) as PostgresJsDatabase<typeof schema> & { $client: postgres.Sql };

export * from "./db/schema";