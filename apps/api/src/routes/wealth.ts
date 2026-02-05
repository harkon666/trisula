import { Hono } from "hono";
import { WealthAggregatorService } from "../services/WealthAggregator";
import { db, fiatAccounts } from "@repo/database";
import { eq } from "drizzle-orm";

const wealthCalls = new Hono();

// GET /wealth/summary - Get Total AUM & Tier
wealthCalls.get("/summary", async (c) => {
    const walletAddress = c.req.query("walletAddress");
    if (!walletAddress) return c.json({ error: "walletAddress is required" }, 400);

    try {
        const profile = await WealthAggregatorService.calculateWealthProfileByWallet(walletAddress);
        return c.json(profile);
    } catch (error: any) {
        return c.json({ error: error.message }, 500); // 500 or 404 depending on error
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
