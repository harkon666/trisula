import { db, users, profiles, rewards, waInteractions, polisData, pointsLedger, agentActivationCodes, products, redeemRequests, announcements, announcementViews, loginLogs, userActivityLogs, adminActions } from "./index";

async function reset() {
    console.log("🧨 Resetting database...");
    console.log("⚠️  Using Neon-compatible reset (delete tables in correct order)...");

    try {
        // Order matters: delete tables that reference others FIRST
        await db.delete(redeemRequests);
        await db.delete(announcementViews);
        await db.delete(announcements);
        await db.delete(waInteractions);
        await db.delete(pointsLedger);
        await db.delete(polisData);
        await db.delete(userActivityLogs);
        await db.delete(adminActions);
        await db.delete(loginLogs);
        // agentActivationCodes has FK to users (generatedBy, usedBy) - must delete before users
        await db.delete(agentActivationCodes);
        await db.delete(profiles);
        await db.delete(users);
        await db.delete(products);
        await db.delete(rewards);

        console.log("✅ Database reset complete (all tables deleted in correct order).");
    } catch (error) {
        console.error("❌ Reset failed:", error);
    } finally {
        process.exit();
    }
}

reset();