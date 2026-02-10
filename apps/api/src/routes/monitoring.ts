import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, waInteractions, users, profiles } from '@repo/database';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';

const monitoringRoute = new Hono<{ Variables: { user: AuthUser } }>();

// Env for Cron Secret
const CRON_SECRET = process.env.CRON_SECRET || 'secure_cron_secret_123';

/**
 * @route   POST /api/v1/monitoring/interaction
 * @desc    Log User Interaction (Click WA)
 * @access  Authenticated User (Agent/Nasabah)
 */
monitoringRoute.post('/interaction', rbacMiddleware(), zValidator('json', z.object({
    agentId: z.string().uuid().optional(), // If Nasabah clicks Agent WA
})), async (c) => {
    const user = c.get('user');
    const { agentId } = c.req.valid('json');

    try {
        await db.insert(waInteractions).values({
            nasabahId: user.role === 'nasabah' ? user.id : undefined,
            agentId: agentId || (user.role === 'agent' ? user.id : undefined), // Fallback if agent clicks own?
            // Logic: usually Nasabah clicks Agent.
            clickedAt: new Date(),
            isAdminNotified: false
        });

        return c.json({ success: true, message: "Interaction logged" });
    } catch (error) {
        console.error("Log Interaction Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /api/v1/monitoring/watchdog
 * @desc    Cron Job to check stale interactions (> 5 mins)
 * @access  System (Header Auth)
 */
monitoringRoute.post('/watchdog', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return c.json({ success: false, message: "Unauthorized Cron" }, 401);
    }

    try {
        // 1. Calculate Threshold (5 minutes ago)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // 2. Find Stale Interactions (Not notified)
        const staleInteractions = await db.select()
            .from(waInteractions)
            .where(and(
                lt(waInteractions.clickedAt, fiveMinutesAgo),
                eq(waInteractions.isAdminNotified, false)
            ))
            .limit(50); // Batch size

        if (staleInteractions.length === 0) {
            return c.json({ success: true, message: "No stale interactions found" });
        }

        console.log(`🐶 Watchdog found ${staleInteractions.length} stale interactions.`);

        // 3. Process Notifications (Mock) & Update Status
        const idsToUpdate = staleInteractions.map(i => i.id);

        // In production: Send Telegram/Email alert here
        // await NotificationService.sendAdminAlert(staleInteractions);

        // 4. Mark as Notified
        // Drizzle doesn't support 'where in' update easily in some versions, iterating or raw sql
        // Or simple loop
        for (const item of staleInteractions) {
            await db.update(waInteractions)
                .set({ isAdminNotified: true })
                .where(eq(waInteractions.id, item.id));
        }

        return c.json({
            success: true,
            message: `Processed ${staleInteractions.length} stale interactions`,
            ids: idsToUpdate
        });

    } catch (error) {
        console.error("Watchdog Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default monitoringRoute;
