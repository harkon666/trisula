import { db } from "./index";
import { sql } from "drizzle-orm";

async function reset() {
    console.log("🧨 Resetting database...");
    try {
        // Drop all tables in public schema
        await db.execute(sql`
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO postgres;
            GRANT ALL ON SCHEMA public TO public;
        `);
        console.log("✅ Database reset complete (public schema recreated).");
    } catch (error) {
        console.error("❌ Reset failed:", error);
    } finally {
        process.exit();
    }
}

reset();
