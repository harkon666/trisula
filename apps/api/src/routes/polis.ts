import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, polisData, users, profiles } from '@repo/database';
import { eq, desc, and, or } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';
import { PointsService } from '../services/points';

const polisRoute = new Hono<{ Variables: { user: AuthUser } }>();

// Schemas
const InputPolisSchema = z.object({
    polisNumber: z.string().min(3),
    nasabahId: z.string().uuid(), // UUID of the user (Nasabah)
    agentId: z.string().uuid(),   // UUID of the user (Agent)
    premiumAmount: z.number().int().positive(),
});

/**
 * @route   POST /api/v1/polis
 * @desc    Input Data Polis (Sales Tracker)
 * @access  Admin Input, Super Admin
 */
polisRoute.post('/', rbacMiddleware(), zValidator('json', InputPolisSchema), async (c) => {
    const { polisNumber, nasabahId, agentId, premiumAmount } = c.req.valid('json');
    const adminUser = c.get('user');

    try {
        const result = await db.transaction(async (tx) => {
            // 1. Validate Agent & Nasabah Existence
            const [nasabah] = await tx.select().from(users).where(eq(users.id, nasabahId)).limit(1);
            if (!nasabah) throw new Error("Nasabah ID not found");

            const [agent] = await tx.select().from(users).where(eq(users.id, agentId)).limit(1);
            if (!agent) throw new Error("Agent ID not found");

            // 2. Check Duplicate Polis Number
            const [existing] = await tx.select().from(polisData).where(eq(polisData.polisNumber, polisNumber)).limit(1);
            if (existing) throw new Error("Nomor Polis sudah terdaftar");

            // 3. Insert Polis Data
            const [newPolis] = await tx.insert(polisData).values({
                polisNumber,
                nasabahId,
                agentId,
                premiumAmount,
                inputBy: adminUser.id,
            }).returning();

            // 4. Inject Points (1 point per 1000 premium)
            const pointsToAward = Math.floor(premiumAmount / 1000);
            if (pointsToAward > 0) {
                await PointsService.addPoints(
                    nasabahId,
                    pointsToAward,
                    'purchase',
                    `Point reward dari Polis #${polisNumber}`,
                    tx
                );
            }

            return newPolis;
        });

        return c.json({ success: true, data: result }, 201);

    } catch (error: any) {
        console.error("Input Polis Error:", error);
        const isClientError = error.message === "Nasabah ID not found" ||
            error.message === "Agent ID not found" ||
            error.message === "Nomor Polis sudah terdaftar";
        return c.json({ success: false, message: error.message || "Internal Server Error" }, isClientError ? 400 : 500);
    }
});

/**
 * @route   GET /api/v1/polis
 * @desc    List All Polis Data
 * @access  Admin View, Super Admin
 */
polisRoute.get('/', rbacMiddleware(), async (c) => {
    try {
        const list = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            premiumAmount: polisData.premiumAmount,
            createdAt: polisData.createdAt,
            nasabahName: profiles.fullName, // simplified join, might need clearer alias
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
            // If Agent, show Nasabah info? If Nasabah, show Agent info?
            // For MVP, just the raw data + basic info
        })
            .from(polisData)
            .where(or(
                eq(polisData.nasabahId, user.id),
                eq(polisData.agentId, user.id)
            ))
            .orderBy(desc(polisData.createdAt));

        return c.json({ success: true, data: list });
    } catch (error) {
        console.error("My Polis Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default polisRoute;
