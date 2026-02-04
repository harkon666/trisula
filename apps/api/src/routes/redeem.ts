import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, redeemCatalog, redeemRequests, pointsBalance, pointsLedger, users } from '@repo/database';
import { BlockchainService } from '../services/blockchain';
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
 * @route   GET /redeem/my-requests
 * @desc    Get redemption history for a specific user
 * @query   userId
 */
redeem.get('/my-requests', async (c) => {
    const userId = c.req.query('userId');
    if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

    try {
        const requests = await db.select({
            id: redeemRequests.id,
            catalogId: redeemRequests.catalogId,
            itemName: redeemCatalog.name,
            pointsUsed: redeemRequests.pointsUsed,
            status: redeemRequests.status,
            onchainTx: redeemRequests.onchainTx,
            createdAt: redeemRequests.createdAt,
            updatedAt: redeemRequests.updatedAt,
        })
            .from(redeemRequests)
            .leftJoin(redeemCatalog, eq(redeemRequests.catalogId, redeemCatalog.id))
            .where(eq(redeemRequests.userId, userId))
            .orderBy(desc(redeemRequests.createdAt));

        return c.json({ success: true, data: requests });
    } catch (error) {
        console.error("My Requests Error:", error);
        return c.json({ success: false, message: "Failed to fetch requests" }, 500);
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

            // 2. Check User Balance & Get Wallet Address
            const [userData] = await tx.select({
                balance: pointsBalance.balance,
                walletAddress: users.walletAddress
            })
                .from(users)
                .leftJoin(pointsBalance, eq(pointsBalance.userId, users.id))
                .where(eq(users.id, userId))
                .limit(1);

            if (!userData || (userData.balance || 0) < item.pointsRequired) {
                return c.json({ success: false, message: "Insufficient points" }, 400);
            }

            // 3. Deduct Points (Database)
            await tx.update(pointsBalance)
                .set({ balance: sql`${pointsBalance.balance} - ${item.pointsRequired}` })
                .where(eq(pointsBalance.userId, userId));

            // 4. Log to Blockchain (Audit Trail)
            let txHash = null;
            console.log(`🔗 Blockchain log attempt for user wallet: ${userData.walletAddress}`);

            if (userData.walletAddress && userData.walletAddress !== "0x0000000000000000000000000000000000000000") {
                try {
                    console.log("📡 Calling BlockchainService.logRedemption...");
                    const receipt = await BlockchainService.logRedemption(
                        userData.walletAddress,
                        catalogId,
                        item.pointsRequired
                    );
                    txHash = receipt.hash;
                    console.log(`✅ On-chain log success! Hash: ${txHash}`);
                } catch (bcError: any) {
                    console.error("❌ Blockchain Logging Failed:", bcError.message || bcError);
                    // We continue because we don't want to block the user if blockchain is slow/down
                    // but we log it for admin investigation.
                }
            } else {
                console.warn("⚠️ Skipping blockchain log: No valid wallet address found for user.");
            }

            // 5. Create Ledger Entry
            await tx.insert(pointsLedger).values({
                userId,
                amount: -item.pointsRequired,
                reason: `Redeem: ${item.name}`,
                source: 'redeem',
                onchainTx: txHash,
            });

            // 6. Create Redeem Request
            const [request] = await tx.insert(redeemRequests).values({
                userId,
                catalogId,
                pointsUsed: item.pointsRequired,
                whatsappNumber,
                status: 'pending',
                onchainTx: txHash,
            }).returning();

            console.log(`🎁 Redeem request created in DB with ID: ${request.id}`);

            return c.json({ success: true, message: "Redeem requested successfully", data: request }, 201);
        });

    } catch (error) {
        console.error("Redeem Error:", error);
        return c.json({ success: false, message: "Failed to process redemption" }, 500);
    }
});

export default redeem;
