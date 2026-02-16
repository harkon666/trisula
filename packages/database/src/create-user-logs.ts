
import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Creating user_activity_logs table...");

    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "user_activity_logs" (
            "id" SERIAL PRIMARY KEY,
            "user_id" UUID REFERENCES "users"("id"),
            "action" TEXT NOT NULL,
            "details" JSONB,
            "ip_address" TEXT,
            "user_agent" TEXT,
            "created_at" TIMESTAMP DEFAULT NOW()
        );
    `);

    console.log("Table user_activity_logs created successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
