import { Hono } from "hono";
import { db, dailyYieldLogs, users } from "@repo/database";
import { and, eq } from "drizzle-orm";

const rewardsRoutes = new Hono();

// GET /rewards/estimate - Get estimated yield for current user
rewardsRoutes.get("/estimate", async (c) => {
    const walletAddress = c.req.query("walletAddress");
    // const userId = c.req.header("x-user-id"); // Alternative

    // We need to resolve wallet -> userId if using wallet param
    // But WealthAggregator handles this inside. RewardService currently takes userId.
    // Let's stick to consistent pattern.

    // For MVP transparency: Just calculate based on Wealth endpoint in frontend.
    // But provides a dedicated endpoint is nice.

    return c.json({ message: "Use Wealth Aggregator to estimate locally for now" });
});

// POST /rewards/reset-claim (DEV ONLY)
rewardsRoutes.post("/reset-claim", async (c) => {
    const { walletAddress } = await c.req.json();

    if (!walletAddress) return c.json({ error: "Wallet address required" }, 400);

    const user = await db.query.users.findFirst({
        where: eq(users.walletAddress, walletAddress)
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    const today = new Date().toISOString().split('T')[0];

    await db.delete(dailyYieldLogs)
        .where(and(
            eq(dailyYieldLogs.userId, user.id),
            eq(dailyYieldLogs.date, today)
        ));

    return c.json({ success: true, message: `Reset yield for ${user.email}` });
});

export default rewardsRoutes;
