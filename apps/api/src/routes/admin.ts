import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users, redeemRequests, pointsBalance, pointsLedger, redeemCatalog } from '@repo/database';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { BlockchainService } from '../services/blockchain.js';

const admin = new Hono();

// Schema for Verify Request - Updated to include 'rejected' status
const UpdateRedeemStatusSchema = z.object({
    status: z.enum(['processing', 'ready', 'completed', 'rejected']),
    adminWallet: z.string(),
    reason: z.string().optional(), // Required for rejected
});

// Final states that cannot be changed
const FINAL_STATES = ['completed', 'cancelled', 'rejected'];

// Middleware helper (simplified) to check admin role
async function isAdmin(walletAddress: string) {
    if (!walletAddress) return false;
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
    return user && (user.role === 'admin' || user.role === 'super_admin');
}

/**
 * @route   GET /redeem/pending
 * @desc    List all pending/processing/ready redeem requests
 */
admin.get('/redeem/pending', async (c) => {
    const adminWallet = c.req.query('adminWallet');
    if (!adminWallet || !await isAdmin(adminWallet)) {
        return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    try {
        const requests = await db.select({
            id: redeemRequests.id,
            userName: users.name,
            itemName: redeemCatalog.name,
            pointsUsed: redeemRequests.pointsUsed,
            whatsapp: redeemRequests.whatsappNumber,
            status: redeemRequests.status,
            txHash: redeemRequests.txHash,
            createdAt: redeemRequests.createdAt,
        })
            .from(redeemRequests)
            .leftJoin(users, eq(redeemRequests.userId, users.id))
            .leftJoin(redeemCatalog, eq(redeemRequests.rewardId, redeemCatalog.id))
            .where(sql`${redeemRequests.status} IN ('pending', 'processing', 'ready')`)
            .orderBy(sql`${redeemRequests.createdAt} DESC`);

        return c.json({ success: true, data: requests });
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return c.json({ success: false, message: "Failed to fetch requests" }, 500);
    }
});

/**
 * @route   PATCH /redeem/:id
 * @desc    Update redemption status (Fulfillment / Rejection by Admin)
 */
admin.patch('/redeem/:id', zValidator('json', UpdateRedeemStatusSchema), async (c) => {
    const requestId = c.req.param('id');
    const { status, adminWallet, reason } = c.req.valid('json');

    if (!await isAdmin(adminWallet)) {
        return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    // Require reason for rejected status
    if (status === 'rejected' && !reason) {
        return c.json({ success: false, message: "Alasan penolakan wajib diisi" }, 400);
    }

    try {
        return await db.transaction(async (tx) => {
            // 1. Get Request
            const [request] = await tx.select().from(redeemRequests).where(eq(redeemRequests.id, requestId)).limit(1);
            if (!request) {
                return c.json({ success: false, message: "Request not found" }, 404);
            }

            // 2. State Machine: Block changes from final states
            if (FINAL_STATES.includes(request.status)) {
                return c.json({
                    success: false,
                    message: `Pesanan dengan status "${request.status}" tidak dapat diubah.`
                }, 400);
            }

            // 3. Refund Logic for REJECTED
            if (status === 'rejected') {
                console.log(`🔄 Refunding ${request.pointsUsed} points to user ${request.userId} (Admin Rejection)`);

                await tx.update(pointsBalance)
                    .set({ balance: sql`${pointsBalance.balance} + ${request.pointsUsed}` })
                    .where(eq(pointsBalance.userId, request.userId));

                const [ledgerEntry] = await tx.insert(pointsLedger).values({
                    userId: request.userId,
                    amount: request.pointsUsed,
                    source: 'admin',
                    reason: `Refund: Ditolak Admin - ${reason}`,
                    createdAt: new Date(),
                }).returning({ id: pointsLedger.id });

                if (!ledgerEntry) throw new Error("Failed to create ledger entry");

                // Log refund to blockchain (async, don't block)
                const [user] = await tx.select({ walletAddress: users.walletAddress })
                    .from(users).where(eq(users.id, request.userId)).limit(1);

                if (user?.walletAddress) {
                    BlockchainService.logPointsAdded(
                        user.walletAddress,
                        BigInt(request.pointsUsed),
                        `Refund: Rejected - ${reason}`
                    ).then(async (tx) => {
                        if (tx?.hash) {
                            // Update ledger with txHash
                            await db.update(pointsLedger)
                                .set({ txHash: tx.hash })
                                .where(eq(pointsLedger.id, ledgerEntry.id));
                            console.log(`✅ Refund logged on-chain: ${tx.hash}`);
                        }
                    }).catch((err) => {
                        console.error(`⚠️ Blockchain refund log failed: ${err.message}`);
                    });
                }
            }

            // 4. Update Status with metadata
            const updatedMetadata = {
                ...request.metadata as object,
                ...(status === 'rejected' ? { rejectedReason: reason, rejectedAt: new Date().toISOString(), rejectedBy: 'admin' } : {}),
            };

            await tx.update(redeemRequests)
                .set({
                    status,
                    updatedAt: new Date(),
                    metadata: updatedMetadata
                })
                .where(eq(redeemRequests.id, requestId));

            const successMessage = status === 'rejected'
                ? `Permintaan ditolak. Poin telah dikembalikan ke nasabah.`
                : `Status diperbarui ke ${status}`;

            return c.json({ success: true, message: successMessage });
        });

    } catch (error) {
        console.error("Admin Update Error:", error);
        return c.json({ success: false, message: "Failed to process update" }, 500);
    }
});

export default admin;
