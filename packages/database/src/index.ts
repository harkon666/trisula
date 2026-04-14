import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';

// Environment variables are automatically available in Vercel serverless
// For local development, use: bun --env-file=../../.env run dev

// Using postgres driver with connection pooling for serverless compatibility
// Neon Pooler handles connection pooling efficiently
const client = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 1, // critical for serverless - limits connections per function instance
  idle_timeout: 20,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });

export * from "./db/schema";