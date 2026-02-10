import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users, redeemRequests, pointsLedger, rewards, profiles, roleEnum } from '@repo/database';
import { eq, inArray, sql, desc } from 'drizzle-orm';
import { z } from 'zod';
import { rbacMiddleware } from '../middlewares/rbac';

const admin = new Hono();

// Apply Strict RBAC Middleware
admin.use('*', rbacMiddleware());

// Schema for Verify Request
const UpdateRedeemStatusSchema = z.object({
    status: z.enum(['processing', 'ready', 'completed', 'rejected']),
    reason: z.string().optional(), // Required for rejected
});

// Final states that cannot be changed
const FINAL_STATES = ['completed', 'cancelled', 'rejected'];

/**
 * @route   GET /redeem/pending
 * @desc    List all pending/processing/ready redeem requests
 * @access  Super Admin, Admin View
 */
admin.get('/redeem/pending', async (c) => {
    // RBAC Middleware handles role checks (Admin View & Super Admin allowed for GET)

    try {
        const requests = await db.select({
            id: redeemRequests.id,
            userName: profiles.fullName, // Get name from profiles
            itemName: rewards.title,     // Get title from rewards
            pointsUsed: rewards.requiredPoints,
            whatsapp: profiles.whatsapp, // Get WA from profiles
            status: redeemRequests.status,
            createdAt: redeemRequests.createdAt,
            // txHash: pointsLedger.txHash, // Optional: join with ledger if needed
        })
            .from(redeemRequests)
            .leftJoin(users, eq(redeemRequests.nasabahId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .leftJoin(rewards, eq(redeemRequests.rewardId, rewards.id))
            .where(inArray(redeemRequests.status, ['pending', 'processing', 'ready']))
            .orderBy(desc(redeemRequests.createdAt));

        return c.json({ success: true, data: requests });
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return c.json({ success: false, message: "Failed to fetch requests" }, 500);
    }
});

/**
 * @route   PATCH /redeem/:id
 * @desc    Update redemption status (Fulfillment / Rejection by Admin)
 * @access  Super Admin (Admin Input is POST only, Admin View is GET only)
 */
admin.patch('/redeem/:id', zValidator('json', UpdateRedeemStatusSchema), async (c) => {
    const requestId = c.req.param('id');
    const { status, reason } = c.req.valid('json');

    // RBAC: Only Super Admin can PATCH (Admin Input restricted to POST)

    // Require reason for rejected status
    if (status === 'rejected' && !reason) {
        return c.json({ success: false, message: "Alasan penolakan wajib diisi" }, 400);
    }

    try {
        return await db.transaction(async (tx) => {
            // 1. Get Request with Reward details for points calculation
            const [request] = await tx.select({
                id: redeemRequests.id,
                status: redeemRequests.status,
                userId: redeemRequests.nasabahId,
                pointsRequired: rewards.requiredPoints,
                metadata: redeemRequests.metadata
            })
                .from(redeemRequests)
                .leftJoin(rewards, eq(redeemRequests.rewardId, rewards.id))
                .where(eq(redeemRequests.id, requestId))
                .limit(1);

            if (!request) {
                return c.json({ success: false, message: "Request not found" }, 404);
            }

            // 2. State Machine: Block changes from final states
            if (request.status && FINAL_STATES.includes(request.status)) {
                return c.json({
                    success: false,
                    message: `Pesanan dengan status "${request.status}" tidak dapat diubah.`
                }, 400);
            }

            // 3. Refund Logic for REJECTED
            if (status === 'rejected') {
                const pointsToRefund = request.pointsRequired || 0;
                console.log(`🔄 Refunding ${pointsToRefund} points to user ${request.userId} (Admin Rejection)`);

                await tx.update(users) // Update users table (pointsBalance)
                    .set({ pointsBalance: sql`${users.pointsBalance} + ${pointsToRefund}` })
                    .where(eq(users.id, request.userId));

                await tx.insert(pointsLedger).values({
                    userId: request.userId,
                    amount: pointsToRefund,
                    source: 'refund', // Source: refund
                    description: `Refund: Ditolak Admin - ${reason}`,
                    createdAt: new Date(),
                });
            }

            // 4. Update Status with metadata
            const currentMetadata = request.metadata as Record<string, any> || {};
            const updatedMetadata = {
                ...currentMetadata,
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
