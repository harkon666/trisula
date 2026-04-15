import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, polisData, users, profiles } from '@repo/database';
import { eq, desc, and, or } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';
import { PointsService } from '../services/points';

const polisRoute = new Hono<{ Variables: { user: AuthUser } }>();

// --- Schemas ---
const AdminPolisSchema = z.object({
    polisNumber: z.string().min(3),
    nasabahId: z.string().uuid(),
    agentId: z.string().uuid(),
    premiumAmount: z.number().int().positive(),
    productName: z.string().min(1, "Nama polis/produk wajib diisi"),
});

const AgentPolisSchema = z.object({
    polisNumber: z.string().min(3),
    nasabahId: z.string().uuid(),
    premiumAmount: z.number().int().positive(),
    productName: z.string().min(1, "Nama polis/produk wajib diisi"),
});

const ApprovePolisSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().optional(),
});

/**
 * @route   POST /api/v1/polis
 * @desc    Input Data Polis by Admin (Direct approve)
 * @access  Admin Input, Super Admin
 */
polisRoute.post('/', rbacMiddleware('polis'), zValidator('json', AdminPolisSchema), async (c) => {
    const data = c.req.valid('json');
    const adminUser = c.get('user');

    try {
        const result = await db.transaction(async (tx) => {
            const [nasabah] = await tx.select().from(users).where(eq(users.id, data.nasabahId)).limit(1);
            if (!nasabah) throw new Error("Nasabah ID not found");

            const [agent] = await tx.select().from(users).where(eq(users.id, data.agentId)).limit(1);
            if (!agent) throw new Error("Agent ID not found");

            const [existing] = await tx.select().from(polisData).where(eq(polisData.polisNumber, data.polisNumber)).limit(1);
            if (existing) throw new Error("Nomor Polis sudah terdaftar");

            const [newPolis] = await tx.insert(polisData).values({
                polisNumber: data.polisNumber,
                nasabahId: data.nasabahId,
                agentId: data.agentId,
                premiumAmount: data.premiumAmount,
            }).returning();

            const pointsToAward = Math.floor(data.premiumAmount / 1000);
            if (pointsToAward > 0) {
                await PointsService.addPoints(data.nasabahId, pointsToAward, 'purchase', `Point reward dari Polis #${data.polisNumber}`, tx);
            }
            return newPolis;
        });
        return c.json({ success: true, data: result }, 201);
    } catch (error: any) {
        console.error("Input Polis Error:", error);
        return c.json({ success: false, message: error.message || "Internal Server Error" }, 400);
    }
});

/**
 * @route   POST /api/v1/polis/agent-input
 * @desc    Agent inputs polis data (pending approval)
 * @access  Agent
 */
polisRoute.post('/agent-input', rbacMiddleware(), zValidator('json', AgentPolisSchema), async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Hanya agent yang dapat input polis" }, 403);
    }

    try {
        const [nasabah] = await db.select().from(users).where(eq(users.id, data.nasabahId)).limit(1);
        if (!nasabah) throw new Error("Nasabah ID not found");

        const [profile] = await db.select().from(profiles).where(
            and(eq(profiles.userId, data.nasabahId), eq(profiles.referredByAgentId, user.userId))
        ).limit(1);
        if (!profile) throw new Error("Nasabah tidak terdaftar unter anda");

        const [existing] = await db.select().from(polisData).where(eq(polisData.polisNumber, data.polisNumber)).limit(1);
        if (existing) throw new Error("Nomor Polis sudah terdaftar");

        const [newPolis] = await db.insert(polisData).values({
            polisNumber: data.polisNumber,
            nasabahId: data.nasabahId,
            agentId: user.id,
            premiumAmount: data.premiumAmount,
            productName: data.productName,
            status: 'pending',
            inputBy: user.id,
        }).returning();

        return c.json({ success: true, message: "Polis berhasil diinput dan menunggu persetujuan admin", data: newPolis }, 201);
    } catch (error: any) {
        console.error("Agent Input Polis Error:", error);
        return c.json({ success: false, message: error.message || "Internal Server Error" }, 500);
    }
});

/**
 * @route   PATCH /api/v1/polis/:id/approve
 * @desc    Admin approves or rejects polis
 * @access  Admin, Super Admin
 */
polisRoute.patch('/:id/approve', rbacMiddleware('polis'), zValidator('json', ApprovePolisSchema), async (c) => {
    const polisId = c.req.param('id');
    const { status, rejectionReason } = c.req.valid('json');

    if (status === 'rejected' && !rejectionReason) {
        return c.json({ success: false, message: "Alasan penolakan wajib diisi" }, 400);
    }

    try {
        const [polis] = await db.select().from(polisData).where(eq(polisData.id, parseInt(polisId))).limit(1);
        if (!polis) return c.json({ success: false, message: "Polis tidak ditemukan" }, 404);

        // Update the polis status
        await db.update(polisData)
            .set({
                status: status,
                rejectionReason: status === 'rejected' ? rejectionReason : null,
                updatedAt: new Date(),
            })
            .where(eq(polisData.id, parseInt(polisId)));

        // If approved, award points to nasabah
        if (status === 'approved') {
            const pointsToAward = Math.floor(polis.premiumAmount / 1000);
            if (pointsToAward > 0) {
                await PointsService.addPoints(polis.nasabahId, pointsToAward, 'purchase', `Point reward dari Polis #${polis.polisNumber}`);
            }
        }

        return c.json({ success: true, message: status === 'approved' ? "Polis disetujui" : "Polis ditolak" });
    } catch (error: any) {
        console.error("Approve/Reject Polis Error:", error);
        return c.json({ success: false, message: error.message || "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/polis
 * @desc    List All Polis Data (Admin)
 * @access  Admin View, Super Admin
 */
polisRoute.get('/', rbacMiddleware('polis'), async (c) => {
    try {
        const list = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            premiumAmount: polisData.premiumAmount,
            productName: polisData.productName,
            status: polisData.status,
            rejectionReason: polisData.rejectionReason,
            createdAt: polisData.createdAt,
            NasabahName: profiles.fullName,
            agentId: polisData.agentId,
        })
            .from(polisData)
            .leftJoin(users, eq(polisData.nasabahId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .orderBy(desc(polisData.createdAt))
            .limit(100);
        return c.json({ success: true, data: list });
    } catch (error) {
        console.error("Fetch Polis Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/polis/pending
 * @desc    List Pending Polis for Admin Approval
 * @access  Admin, Super Admin
 */
polisRoute.get('/pending', rbacMiddleware('polis'), async (c) => {
    try {
        const pendingList = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            premiumAmount: polisData.premiumAmount,
            productName: polisData.productName,
            status: polisData.status,
            createdAt: polisData.createdAt,
            nasalName: profiles.fullName,
            agentId: polisData.agentId,
        })
            .from(polisData)
            .leftJoin(users, eq(polisData.nasabahId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(polisData.status, 'pending'))
            .orderBy(desc(polisData.createdAt))
            .limit(50);
        return c.json({ success: true, data: pendingList });
    } catch (error) {
        console.error("Fetch Pending Polis Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/polis/my-polis
 * @desc    List Polis for Logged-in User (Agent or Nasabah)
 * @access  Agent, Nasabah
 */
polisRoute.get('/my-polis', rbacMiddleware(), async (c) => {
    const user = c.get('user');
    try {
        const list = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            premiumAmount: polisData.premiumAmount,
            createdAt: polisData.createdAt,
        })
            .from(polisData)
            .where(or(eq(polisData.nasabahId, user.id), eq(polisData.agentId, user.id)))
            .orderBy(desc(polisData.createdAt));
        return c.json({ success: true, data: list });
    } catch (error) {
        console.error("My Polis Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/polis/agent-history
 * @desc    Agent's polis input history with status (pending/approved/rejected)
 * @access  Agent
 */
polisRoute.get('/agent-history', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    try {
        const history = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            premiumAmount: polisData.premiumAmount,
            productName: polisData.productName,
            status: polisData.status,
            rejectionReason: polisData.rejectionReason,
            createdAt: polisData.createdAt,
            updatedAt: polisData.updatedAt,
            nasalName: profiles.fullName,
        })
            .from(polisData)
            .leftJoin(users, eq(polisData.nasabahId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(polisData.agentId, user.id))
            .orderBy(desc(polisData.createdAt));
        return c.json({ success: true, data: history });
    } catch (error) {
        console.error("Agent Polis History Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default polisRoute;