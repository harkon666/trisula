import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users, redeemRequests, pointsBalance, pointsLedger, redeemCatalog } from '@repo/database';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
const admin = new Hono();
// Schema for Verify Request
const VerifyRedeemSchema = z.object({
    adminWallet: z.string(),
    requestId: z.string().uuid(),
    action: z.enum(['approve', 'reject']),
    reason: z.string().optional(),
});
// Middleware helper (simplified) to check admin role
async function isAdmin(walletAddress) {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
    return user && (user.role === 'admin' || user.role === 'super_admin');
}
/**
 * @route   GET /redeem/pending
 * @desc    List all pending redeem requests
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
            createdAt: redeemRequests.createdAt,
        })
            .from(redeemRequests)
            .leftJoin(users, eq(redeemRequests.userId, users.id))
            .leftJoin(redeemCatalog, eq(redeemRequests.catalogId, redeemCatalog.id))
            .where(eq(redeemRequests.status, 'pending'));
        return c.json({ success: true, data: requests });
    }
    catch (error) {
        console.error("Admin Fetch Error:", error);
        return c.json({ success: false, message: "Failed to fetch requests" }, 500);
    }
});
/**
 * @route   POST /redeem/verify
 * @desc    Approve or Reject a redemption
 */
admin.post('/redeem/verify', zValidator('json', VerifyRedeemSchema), async (c) => {
    const { adminWallet, requestId, action, reason } = c.req.valid('json');
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
            if (request.status !== 'pending') {
                return c.json({ success: false, message: "Request already processed" }, 400);
            }
            if (action === 'approve') {
                // UPDATE STATUS ONLY
                await tx.update(redeemRequests)
                    .set({ status: 'completed', updatedAt: new Date() })
                    .where(eq(redeemRequests.id, requestId));
                // TODO: Send WhatsApp Message (Optional Integration)
            }
            else if (action === 'reject') {
                // REFUND POINTS
                await tx.update(pointsBalance)
                    .set({ balance: sql `${pointsBalance.balance} + ${request.pointsUsed}` })
                    .where(eq(pointsBalance.userId, request.userId));
                await tx.insert(pointsLedger).values({
                    userId: request.userId,
                    amount: request.pointsUsed,
                    source: 'system',
                    reason: `Redeem Refused: ${reason || 'Admin Rejection'}`,
                    createdAt: new Date(),
                });
                await tx.update(redeemRequests)
                    .set({ status: 'rejected', updatedAt: new Date() })
                    .where(eq(redeemRequests.id, requestId));
            }
            return c.json({ success: true, message: `Request ${action}ed successfully` });
        });
    }
    catch (error) {
        console.error("Admin Verify Error:", error);
        return c.json({ success: false, message: "Failed to process verification" }, 500);
    }
});
export default admin;
