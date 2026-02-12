import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, users, redeemRequests, pointsLedger, rewards, profiles, roleEnum, agentActivationCodes } from '@repo/database';
import { eq, inArray, sql, desc } from 'drizzle-orm';
import { z } from 'zod';
import { rbacMiddleware } from '../middlewares/rbac';

type Env = {
    Variables: {
        user: {
            id: string;
            role: string;
            userId: string;
        };
    };
};

const admin = new Hono<Env>();

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

/**
 * @route   GET /codes
 * @desc    List all agent activation codes
 * @access  Super Admin, Admin View
 */
admin.get('/codes', async (c) => {
    try {
        const codes = await db.select({
            id: agentActivationCodes.id,
            code: agentActivationCodes.code,
            isUsed: agentActivationCodes.isUsed,
            generatedByName: users.userId, // Link to generator ID
            usedByName: profiles.fullName, // Link to user who used it
            createdAt: agentActivationCodes.createdAt,
        })
            .from(agentActivationCodes)
            .leftJoin(users, eq(agentActivationCodes.generatedBy, users.id))
            .leftJoin(profiles, eq(agentActivationCodes.usedBy, profiles.userId))
            .orderBy(desc(agentActivationCodes.createdAt));

        return c.json({ success: true, data: codes });
    } catch (error) {
        console.error("Admin Fetch Codes Error:", error);
        return c.json({ success: false, message: "Failed to fetch codes" }, 500);
    }
});

/**
 * @route   POST /codes
 * @desc    Register a manual activation code
 * @access  Super Admin, Admin Input
 */
admin.post('/codes', zValidator('json', z.object({
    code: z.string().min(3, "Kode minimal 3 karakter"),
})), async (c) => {
    const user = c.get('user');
    const { code } = c.req.valid('json');

    try {
        const [inserted] = await db.insert(agentActivationCodes).values({
            code: code.trim().toUpperCase(),
            generatedBy: user.id,
            isUsed: false,
            createdAt: new Date(),
        }).returning();

        return c.json({
            success: true,
            message: "Activation code registered successfully",
            data: inserted
        }, 201);
    } catch (error: any) {
        // Handle unique constraint error
        if (error.code === '23505' || error.message?.includes('unique')) {
            return c.json({ success: false, message: "Kode sudah terdaftar dalam sistem" }, 400);
        }
        console.error("Code Registration Error:", error);
        return c.json({ success: false, message: "Failed to register code" }, 500);
    }
});

/**
 * @route   DELETE /codes/:id
 * @desc    Delete an unused activation code
 * @access  Super Admin Only
 */
admin.delete('/codes/:id', async (c) => {
    const user = c.get('user');
    const codeId = parseInt(c.req.param('id'));

    if (user.role !== 'super_admin') {
        return c.json({ success: false, message: "Forbidden: Only Super Admin can delete codes" }, 403);
    }

    try {
        // Only delete if it's NOT used
        const [deleted] = await db.delete(agentActivationCodes)
            .where(sql`${agentActivationCodes.id} = ${codeId} AND ${agentActivationCodes.isUsed} = false`)
            .returning();

        if (!deleted) {
            return c.json({ success: false, message: "Code not found or already used" }, 404);
        }

        return c.json({ success: true, message: "Code deleted successfully" });
    } catch (error) {
        console.error("Code Deletion Error:", error);
        return c.json({ success: false, message: "Failed to delete code" }, 500);
    }
});

/**
 * @route   GET /users
 * @desc    List all users with their profiles (filtered by role)
 * @access  Super Admin, Admin View, Admin Input
 */
admin.get('/users', async (c) => {
    const role = c.req.query('role');

    try {
        const query = db.select({
            id: users.id,
            userId: users.userId,
            fullName: profiles.fullName,
            role: users.role,
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId));

        if (role) {
            //@ts-ignore
            query.where(eq(users.role, role));
        }

        const list = await query.orderBy(desc(users.createdAt));
        return c.json({ success: true, data: list });
    } catch (error) {
        console.error("Admin Fetch Users Error:", error);
        return c.json({ success: false, message: "Failed to fetch users" }, 500);
    }
});

/**
 * @route   GET /rewards
 * @desc    List all rewards (Administrative View)
 * @access  Super Admin, Admin View, Admin Input
 */
admin.get('/rewards', async (c) => {
    try {
        const list = await db.select().from(rewards).orderBy(desc(rewards.id));
        return c.json({ success: true, data: list });
    } catch (error) {
        console.error("Admin Fetch Rewards Error:", error);
        return c.json({ success: false, message: "Failed to fetch rewards" }, 500);
    }
});

/**
 * @route   POST /rewards
 * @desc    Create a new reward item
 * @access  Super Admin Only
 */
admin.post('/rewards', zValidator('json', z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    requiredPoints: z.number().int().positive(),
    isActive: z.boolean().default(true),
})), async (c) => {
    const user = c.get('user');
    if (user.role !== 'super_admin') {
        return c.json({ success: false, message: "Forbidden: Only Super Admin can manage catalog" }, 403);
    }

    const data = c.req.valid('json');

    try {
        const [inserted] = await db.insert(rewards).values({
            ...data,
        }).returning();

        return c.json({ success: true, message: "Reward created successfully", data: inserted }, 201);
    } catch (error) {
        console.error("Admin Create Reward Error:", error);
        return c.json({ success: false, message: "Failed to create reward" }, 500);
    }
});

/**
 * @route   PATCH /rewards/:id
 * @desc    Update an existing reward item
 * @access  Super Admin Only
 */
admin.patch('/rewards/:id', zValidator('json', z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    requiredPoints: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
})), async (c) => {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (user.role !== 'super_admin') {
        return c.json({ success: false, message: "Forbidden: Only Super Admin can manage catalog" }, 403);
    }

    const data = c.req.valid('json');

    try {
        const [updated] = await db.update(rewards)
            .set({ ...data })
            .where(eq(rewards.id, id))
            .returning();

        if (!updated) return c.json({ success: false, message: "Reward not found" }, 404);

        return c.json({ success: true, message: "Reward updated successfully", data: updated });
    } catch (error) {
        console.error("Admin Update Reward Error:", error);
        return c.json({ success: false, message: "Failed to update reward" }, 500);
    }
});

/**
 * @route   DELETE /rewards/:id
 * @desc    Hard delete a reward item
 * @access  Super Admin Only
 */
admin.delete('/rewards/:id', async (c) => {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (user.role !== 'super_admin') {
        return c.json({ success: false, message: "Forbidden: Only Super Admin can delete rewards" }, 403);
    }

    try {
        // Warning: Deleting rewards might break references in redeemRequests if not handled.
        // However, schema uses .references(() => rewards.id) without onDelete cascade,
        // so it will fail if there are existing requests.
        const [deleted] = await db.delete(rewards)
            .where(eq(rewards.id, id))
            .returning();

        if (!deleted) return c.json({ success: false, message: "Reward not found or has references" }, 404);

        return c.json({ success: true, message: "Reward deleted successfully" });
    } catch (error) {
        console.error("Admin Delete Reward Error:", error);
        return c.json({ success: false, message: "Gagal menghapus reward (mungkin masih memiliki referensi pesanan)" }, 500);
    }
});

export default admin;
