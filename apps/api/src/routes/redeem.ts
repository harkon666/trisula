import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, redeemCatalog, redeemRequests, pointsBalance, pointsLedger } from '@repo/database';
import { RedeemRequestSchema } from '@repo/shared';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const redeem = new Hono();

// Schema for Redeem Request Input
const RedeemInputSchema = z.object({
    userId: z.string().uuid(),
    catalogId: z.number().int(),
    whatsappNumber: z.string().min(10),
});

/**
 * @route   GET /redeem/catalog
 * @desc    Get all active redeemable items
 */
redeem.get('/catalog', async (c) => {
    try {
        const items = await db.select().from(redeemCatalog).where(eq(redeemCatalog.isActive, true));
        return c.json({ success: true, data: items });
    } catch (error) {
        return c.json({ success: false, message: "Failed to fetch catalog" }, 500);
    }
});

/**
 * @route   POST /redeem/request
 * @desc    Request a reward redemption
 */
redeem.post('/request', zValidator('json', RedeemInputSchema), async (c) => {
    const { userId, catalogId, whatsappNumber } = c.req.valid('json');

    try {
        return await db.transaction(async (tx) => {
            // 1. Get Catalog Item
            const [item] = await tx.select().from(redeemCatalog).where(eq(redeemCatalog.id, catalogId)).limit(1);
            if (!item) {
                return c.json({ success: false, message: "Item not found" }, 404);
            }

            // 2. Check User Balance
            const [userBalance] = await tx.select().from(pointsBalance).where(eq(pointsBalance.userId, userId)).limit(1);
            if (!userBalance || userBalance.balance < item.pointsRequired) {
                return c.json({ success: false, message: "Insufficient points" }, 400);
            }

            // 3. Deduct Points
            await tx.update(pointsBalance)
                .set({ balance: sql`${pointsBalance.balance} - ${item.pointsRequired}` })
                .where(eq(pointsBalance.userId, userId));

            // 4. Create Ledger Entry
            await tx.insert(pointsLedger).values({
                userId,
                amount: -item.pointsRequired,
                reason: `Redeem: ${item.name}`,
                source: 'redeem',
            });

            // 5. Create Redeem Request
            const [request] = await tx.insert(redeemRequests).values({
                userId,
                catalogId,
                pointsUsed: item.pointsRequired,
                whatsappNumber,
                status: 'pending',
            }).returning();

            return c.json({ success: true, message: "Redeem requested successfully", data: request }, 201);
        });

    } catch (error) {
        console.error("Redeem Error:", error);
        return c.json({ success: false, message: "Failed to process redemption" }, 500);
    }
});

export default redeem;
