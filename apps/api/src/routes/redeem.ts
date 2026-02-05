import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, redeemCatalog, redeemRequests, pointsBalance, pointsLedger, users } from '@repo/database';
import { BlockchainService } from '../services/blockchain.js';
import { eq, sql, desc } from 'drizzle-orm';
import { z } from 'zod';

const redeem = new Hono();

// Schema for Redeem Request Input
const RedeemInputSchema = z.object({
    userId: z.string().uuid(),
    rewardId: z.number().int(),
    whatsappNumber: z.string().min(10),
});

/**
 * @route   GET /catalog
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
 * @route   GET /my-requests
 * @desc    Get redemption history for a specific user
 * @query   userId
 */
redeem.get('/my-requests', async (c) => {
    const userId = c.req.query('userId');
    if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

    try {
        const requests = await db.select({
            id: redeemRequests.id,
            rewardId: redeemRequests.rewardId,
            itemName: redeemCatalog.name,
            pointsUsed: redeemRequests.pointsUsed,
            status: redeemRequests.status,
            txHash: redeemRequests.txHash,
            createdAt: redeemRequests.createdAt,
            updatedAt: redeemRequests.updatedAt,
        })
            .from(redeemRequests)
            .leftJoin(redeemCatalog, eq(redeemRequests.rewardId, redeemCatalog.id))
            .where(eq(redeemRequests.userId, userId))
            .orderBy(desc(redeemRequests.createdAt));

        return c.json({ success: true, data: requests });
    } catch (error) {
        console.error("My Requests Error:", error);
        return c.json({ success: false, message: "Failed to fetch requests" }, 500);
    }
});

/**
 * @route   POST /
 * @desc    Request a reward redemption
 * @access  Private (User)
 */
redeem.post('/', zValidator('json', RedeemInputSchema), async (c) => {
    const { userId, rewardId, whatsappNumber } = c.req.valid('json');

    try {
        // 1. Transaction: Validate & Deduct Points & Create Request (PENDING)
        const redeemRequestId = await db.transaction(async (tx) => {
            // A. Get Reward Item
            const [item] = await tx.select().from(redeemCatalog).where(eq(redeemCatalog.id, rewardId)).limit(1);
            if (!item) {
                throw new Error("Reward Item not found");
            }

            // B. Check Balance
            const [userBalance] = await tx.select({
                balance: pointsBalance.balance,
                walletAddress: users.walletAddress
            })
                .from(users)
                .leftJoin(pointsBalance, eq(pointsBalance.userId, users.id))
                .where(eq(users.id, userId))
                .limit(1);

            const currentBalance = userBalance?.balance || 0;
            if (currentBalance < item.pointsRequired) {
                throw new Error("Insufficient points");
            }

            // C. Deduct Points
            await tx.update(pointsBalance)
                .set({ balance: sql`${pointsBalance.balance} - ${item.pointsRequired}` })
                .where(eq(pointsBalance.userId, userId));

            // D. Ledger Entry
            await tx.insert(pointsLedger).values({
                userId,
                amount: -item.pointsRequired,
                reason: `Redeem: ${item.name}`,
                source: 'redeem',
            });

            // E. Create Request (PENDING)
            const [request] = await tx.insert(redeemRequests).values({
                userId,
                rewardId,
                pointsUsed: item.pointsRequired,
                whatsappNumber,
                status: 'pending',
                metadata: { itemName: item.name, price: item.pointsRequired } // Store snapshot
            }).returning({ id: redeemRequests.id });

            return { requestId: request.id, walletAddress: userBalance?.walletAddress, pointsUsed: item.pointsRequired };
        });

        // 2. Blockchain Orchestration (Outside DB Transaction)
        // If this fails, the DB state is still valid (points deducted, request pending).
        // Admin or Cron can retry/process later.

        let txHash: string | null = null;

        if (redeemRequestId.walletAddress) {
            try {
                console.log(`📡 Dispatching Blockchain Oracle for Request ${redeemRequestId.requestId}...`);

                // Call Blockchain Service
                const receipt = await BlockchainService.logRedemption(
                    redeemRequestId.walletAddress,
                    rewardId,
                    redeemRequestId.pointsUsed
                );

                if (receipt && receipt.hash) {
                    txHash = receipt.hash;
                    console.log(`✅ Audit Trail Success: ${txHash}`);

                    // 3. Update Request to PROCESSING with TxHash
                    await db.update(redeemRequests)
                        .set({
                            status: 'processing',
                            txHash: txHash,
                            updatedAt: new Date()
                        })
                        .where(eq(redeemRequests.id, redeemRequestId.requestId));
                }
            } catch (bcError: any) {
                console.error(`⚠️ Blockchain Audit Warning (Request ${redeemRequestId.requestId}):`, bcError.message);
                // We do NOT rollback here. The user paid points, we owe them the reward. 
                // Status remains PENDING so support team knows it needs attention (or retry script picks it up).
            }
        }

        return c.json({
            success: true,
            message: "Redemption queued successfully",
            data: {
                requestId: redeemRequestId.requestId,
                status: txHash ? 'processing' : 'pending',
                txHash
            }
        }, 201);

    } catch (error: any) {
        console.error("Redeem Logic Error:", error);
        const isClientError = error.message === "Insufficient points" || error.message === "Reward Item not found";
        return c.json({ success: false, message: error.message || "Internal Server Error" }, isClientError ? 400 : 500);
    }
});

// Schema for Cancel Request
const CancelInputSchema = z.object({
    userId: z.string().uuid(),
});

/**
 * @route   POST /:id/cancel
 * @desc    Cancel a redemption request (User-initiated)
 * @access  Private (Owner only)
 */
redeem.post('/:id/cancel', zValidator('json', CancelInputSchema), async (c) => {
    const requestId = c.req.param('id');
    const { userId } = c.req.valid('json');

    try {
        return await db.transaction(async (tx) => {
            // 1. Get Request
            const [request] = await tx.select().from(redeemRequests).where(eq(redeemRequests.id, requestId)).limit(1);

            if (!request) {
                return c.json({ success: false, message: "Request not found" }, 404);
            }

            // 2. Ownership Check
            if (request.userId !== userId) {
                return c.json({ success: false, message: "Unauthorized" }, 403);
            }

            // 3. State Machine: Only allow cancel from pending/processing
            const CANCELLABLE_STATES = ['pending', 'processing'];
            if (!CANCELLABLE_STATES.includes(request.status)) {
                return c.json({
                    success: false,
                    message: `Pesanan dengan status "${request.status}" tidak dapat dibatalkan.`
                }, 400);
            }

            // 4. Refund Points
            await tx.update(pointsBalance)
                .set({ balance: sql`${pointsBalance.balance} + ${request.pointsUsed}` })
                .where(eq(pointsBalance.userId, userId));

            await tx.insert(pointsLedger).values({
                userId,
                amount: request.pointsUsed,
                source: 'system',
                reason: `Refund: Pembatalan oleh pengguna`,
            });

            // 5. Update Status to Cancelled
            await tx.update(redeemRequests)
                .set({
                    status: 'cancelled',
                    updatedAt: new Date(),
                    metadata: { ...request.metadata as object, cancelledBy: 'user', cancelledAt: new Date().toISOString() }
                })
                .where(eq(redeemRequests.id, requestId));

            return c.json({
                success: true,
                message: "Pembatalan berhasil. Poin telah dikembalikan ke saldo Anda."
            });
        });

    } catch (error: any) {
        console.error("Cancel Error:", error);
        return c.json({ success: false, message: "Gagal membatalkan pesanan" }, 500);
    }
});

export default redeem;
