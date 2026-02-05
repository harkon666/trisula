import { Hono } from "hono";
import { WealthAggregatorService } from "../services/WealthAggregator";
import { db, fiatAccounts } from "@repo/database";
import { eq } from "drizzle-orm";

const wealthCalls = new Hono();

// GET /wealth/summary - Get Total AUM & Tier
wealthCalls.get("/summary", async (c) => {
    // Mock User ID (In prod, get from JWT)
    const userId = c.req.header("x-user-id");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    try {
        const profile = await WealthAggregatorService.calculateWealthProfile(userId);
        return c.json(profile);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// POST /wealth/simulate-deposit - Demo only
wealthCalls.post("/simulate-deposit", async (c) => {
    const { userId, amount } = await c.req.json();

    // Check if account exists
    const existing = await db.query.fiatAccounts.findFirst({
        where: eq(fiatAccounts.userId, userId)
    });

    if (existing) {
        // Update balance
        const newBalance = parseFloat(existing.balance) + amount;
        await db.update(fiatAccounts)
            .set({ balance: newBalance.toString() })
            .where(eq(fiatAccounts.userId, userId));
    } else {
        // Create new
        await db.insert(fiatAccounts).values({
            userId,
            balance: amount.toString(),
            currency: "IDR"
        });
    }

    return c.json({ message: "Deposit success", amount });
});

export default wealthCalls;
