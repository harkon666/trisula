import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users, redeemRequests, pointsBalance, pointsLedger, redeemCatalog } from '@repo/database';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const admin = new Hono();

// Schema for Verify Request
const UpdateRedeemStatusSchema = z.object({
    status: z.enum(['processing', 'ready', 'completed', 'cancelled']),
    adminWallet: z.string(), // Ideally this comes from JWT/Auth middleware, but using body for now as per previous pattern
    reason: z.string().optional(),
});

// Middleware helper (simplified) to check admin role
async function isAdmin(walletAddress: string) {
    if (!walletAddress) return false;
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
    return user && (user.role === 'admin' || user.role === 'super_admin');
}

/**
 * @route   GET /redeem/pending
 * @desc    List all pending/processing redeem requests
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
            .where(sql`${redeemRequests.status} IN ('pending', 'processing')`)
            .orderBy(sql`${redeemRequests.createdAt} DESC`);

        return c.json({ success: true, data: requests });
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return c.json({ success: false, message: "Failed to fetch requests" }, 500);
    }
});

/**
 * @route   PATCH /redeem/:id
 * @desc    Update redemption status (Fulfillment / Cancellation)
 */
admin.patch('/redeem/:id', zValidator('json', UpdateRedeemStatusSchema), async (c) => {
    const requestId = c.req.param('id');
    const { status, adminWallet, reason } = c.req.valid('json');

    if (!await isAdmin(adminWallet)) {
        return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    try {
        return await db.transaction(async (tx) => {
            // 1. Get Request
            const [request] = await tx.select().from(redeemRequests).where(eq(redeemRequests.id, requestId)).limit(1);
            if (!request) {
                return c.json({ success: false, message: "Request not found" }, 404);
            }

            if (request.status === 'cancelled' || request.status === 'completed' || request.status === 'rejected') {
                return c.json({ success: false, message: `Request is already ${request.status}` }, 400);
            }

            if (status === 'cancelled') {
                // REFUND LOGIC
                console.log(`🔄 Refunding ${request.pointsUsed} points to user ${request.userId}`);

                await tx.update(pointsBalance)
                    .set({ balance: sql`${pointsBalance.balance} + ${request.pointsUsed}` })
                    .where(eq(pointsBalance.userId, request.userId));

                await tx.insert(pointsLedger).values({
                    userId: request.userId,
                    amount: request.pointsUsed,
                    source: 'system', // or admin
                    reason: `Refunding Redeem: ${reason || 'Admin Cancel'}`,
                    createdAt: new Date(),
                });
            }

            // UPDATE STATUS
            await tx.update(redeemRequests)
                .set({ status, updatedAt: new Date() })
                .where(eq(redeemRequests.id, requestId));

            return c.json({ success: true, message: `Request updated to ${status}` });
        });

    } catch (error) {
        console.error("Admin Update Error:", error);
        return c.json({ success: false, message: "Failed to process update" }, 500);
    }
});

export default admin;
