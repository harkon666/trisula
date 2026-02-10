import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, rewards, redeemRequests, pointsLedger, users } from '@repo/database';
import { eq, sql, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';

const redeem = new Hono<{ Variables: { user: AuthUser } }>();

// Apply Auth Middleware (assumes global auth middleware runs before this)
// But we need to use RBAC or assume user context is present.
// Since index.ts mounts this, lets add RBAC/Auth check if needed or rely on parent.
// For now, let's use rbacMiddleware to ensure user context.
redeem.use('*', rbacMiddleware());

// Schema for Redeem Request Input
const RedeemInputSchema = z.object({
    rewardId: z.number().int(),
    whatsappNumber: z.string().min(10).optional(), // Optional if already in profile? Let's require for confirmation
});

/**
 * @route   GET /catalog
 * @desc    Get all active redeemable items
 * @access  Public / Authenticated
 */
redeem.get('/catalog', async (c) => {
    try {
        const items = await db.select().from(rewards).where(eq(rewards.isActive, true));
        return c.json({ success: true, data: items });
    } catch (error) {
        return c.json({ success: false, message: "Failed to fetch catalog" }, 500);
    }
});

/**
 * @route   GET /my-requests
 * @desc    Get redemption history for the current user
 * @access  Private (User)
 */
redeem.get('/my-requests', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

    try {
        const requests = await db.select({
            id: redeemRequests.id,
            rewardId: redeemRequests.rewardId,
            itemName: rewards.title,
            pointsUsed: rewards.requiredPoints, // Or from request metadata if stored?
            status: redeemRequests.status,
            createdAt: redeemRequests.createdAt,
            updatedAt: redeemRequests.updatedAt,
            metadata: redeemRequests.metadata,
        })
            .from(redeemRequests)
            .leftJoin(rewards, eq(redeemRequests.rewardId, rewards.id))
            .where(eq(redeemRequests.nasabahId, user.id))
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
    const user = c.get('user');
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

    const { rewardId, whatsappNumber } = c.req.valid('json');

    try {
        // 1. Transaction: Validate & Deduct Points & Create Request (PENDING)
        const result = await db.transaction(async (tx) => {
            // A. Get Reward Item
            const [item] = await tx.select().from(rewards).where(eq(rewards.id, rewardId)).limit(1);
            if (!item) {
                throw new Error("Reward Item not found");
            }

            // B. Check Balance
            // We need to lock user row? Drizzle doesn't support easy locking yet without raw SQL.
            // Let's rely on standard read.
            const [userRecord] = await tx.select().from(users).where(eq(users.id, user.id)).limit(1);

            const currentBalance = userRecord?.pointsBalance || 0;
            if (currentBalance < item.requiredPoints) {
                throw new Error("Poin tidak mencukupi");
            }

            // C. Deduct Points
            await tx.update(users)
                .set({ pointsBalance: sql`${users.pointsBalance} - ${item.requiredPoints}` })
                .where(eq(users.id, user.id));

            // D. Ledger Entry
            await tx.insert(pointsLedger).values({
                userId: user.id,
                amount: -item.requiredPoints,
                source: 'redeem',
                description: `Penukaran untuk ${item.title}`,
                createdAt: new Date(),
            });

            // E. Create Request (PENDING)
            const [request] = await tx.insert(redeemRequests).values({
                nasabahId: user.id,
                rewardId,
                status: 'pending',
                adminNotes: whatsappNumber ? `WA: ${whatsappNumber}` : undefined,
                metadata: { itemName: item.title, price: item.requiredPoints } // Store snapshot
            }).returning({ id: redeemRequests.id });

            if (!request) throw new Error("Failed to create redeem request");

            return request;
        });

        return c.json({
            success: true,
            message: "Permintaan penukaran berhasil dibuat. Mohon tunggu konfirmasi admin.",
            data: {
                requestId: result.id,
                status: 'pending'
            }
        }, 201);

    } catch (error: any) {
        console.error("Redeem Logic Error:", error);
        const isClientError = error.message === "Poin tidak mencukupi" || error.message === "Reward Item not found";
        return c.json({ success: false, message: error.message || "Internal Server Error" }, isClientError ? 400 : 500);
    }
});

// Schema for Cancel Request
const CancelInputSchema = z.object({
    reason: z.string().optional(),
});

/**
 * @route   POST /:id/cancel
 * @desc    Cancel a redemption request (User-initiated)
 * @access  Private (Owner only)
 */
redeem.post('/:id/cancel', zValidator('json', CancelInputSchema), async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

    const requestId = c.req.param('id');
    const { reason } = c.req.valid('json');

    try {
        return await db.transaction(async (tx) => {
            // 1. Get Request
            const [request] = await tx.select({
                id: redeemRequests.id,
                status: redeemRequests.status,
                nasabahId: redeemRequests.nasabahId,
                rewardId: redeemRequests.rewardId,
                metadata: redeemRequests.metadata,
                requiredPoints: rewards.requiredPoints // Join to get points back? Or use metadata snapshot?
            })
                .from(redeemRequests)
                .leftJoin(rewards, eq(redeemRequests.rewardId, rewards.id))
                .where(eq(redeemRequests.id, requestId))
                .limit(1);

            if (!request) {
                return c.json({ success: false, message: "Request not found (404)" }, 404);
            }

            // 2. Ownership Check
            if (request.nasabahId !== user.id) {
                return c.json({ success: false, message: "Unauthorized" }, 403);
            }

            // 3. State Machine: Only allow cancel from pending
            // Processing means admin is working on it, maybe shouldn't auto-cancel?
            // "If status redeem cancelled ... poin harus otomatis kembali"
            const CANCELLABLE_STATES = ['pending']; // Let's simplify to pending for user cancellation. processing = admin lock.
            if (!request.status || !CANCELLABLE_STATES.includes(request.status)) {
                return c.json({
                    success: false,
                    message: `Pesanan dengan status "${request.status}" tidak dapat dibatalkan.`
                }, 400);
            }

            // 4. Calculate Refund Amount
            // Prefer metadata snapshot if available, else current reward price
            const pointCost = (request.metadata as any)?.price || request.requiredPoints || 0;

            // 5. Refund Points
            await tx.update(users)
                .set({ pointsBalance: sql`${users.pointsBalance} + ${pointCost}` })
                .where(eq(users.id, user.id));

            await tx.insert(pointsLedger).values({
                userId: user.id,
                amount: pointCost,
                source: 'refund',
                description: `Refund: Pembatalan User (${reason || 'User cancelled request'})`, // Merged reason into description
                createdAt: new Date(),
            });

            // 6. Update Status to Cancelled
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
