import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

// Environment variables are automatically available in Vercel serverless
// For local development, use: bun --env-file=../../.env run dev

// Using neon serverless http driver for edge compatibility
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export * from "./db/schema";