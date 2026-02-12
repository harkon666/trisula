import { Hono } from 'hono';
import { db, users, pointsLedger, profiles, agentActivationCodes } from '@repo/database';
import { eq, desc, sql } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';
import { PointsService } from '../services/points.js';

const user = new Hono<{ Variables: { user: AuthUser } }>();

// Apply Auth Middleware
user.use('*', rbacMiddleware());

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile and points balance
 * @access  Private (User)
 */
user.get('/profile', async (c) => {
    const contextUser = c.get('user');
    if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);

    try {
        const [userData] = await db.select({
            id: users.id,
            userId: users.userId,
            fullName: profiles.fullName,
            email: profiles.email,
            whatsapp: profiles.whatsapp,
            role: users.role,
            status: users.isActive,
            points: users.pointsBalance,
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.id, contextUser.id))
            .limit(1);

        if (!userData) {
            return c.json({ success: false, message: "User not found" }, 404);
        }

        const isDailyClaimed = await PointsService.isClaimedToday(contextUser.id);

        return c.json({
            success: true,
            data: {
                ...userData,
                points: userData.points || 0,
                isDailyClaimed
            }
        });

    } catch (error) {
        console.error("Profile Error:", error);
        return c.json({ success: false, message: "Failed to fetch profile" }, 500);
    }
});

/**
 * @route   GET /api/v1/user/activity
 * @desc    Get points history
 * @access  Private (User)
 */
user.get('/activity', async (c) => {
    const contextUser = c.get('user');
    if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);

    try {
        const history = await db.select({
            id: pointsLedger.id,
            amount: pointsLedger.amount,
            description: pointsLedger.description,
            source: pointsLedger.source,
            createdAt: pointsLedger.createdAt,
        })
            .from(pointsLedger)
            .where(eq(pointsLedger.userId, contextUser.id))
            .orderBy(desc(pointsLedger.createdAt))
            .limit(50);

        return c.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error("Activity Error:", error);
        return c.json({ success: false, message: "Failed to fetch activity" }, 500);
    }
});

/**
 * @route   GET /api/v1/user/my-referrals
 * @desc    Get list of nasabah referred by this agent
 * @access  Private (Agent)
 */
user.get('/my-referrals', async (c) => {
    const contextUser = c.get('user');
    if (contextUser.role !== 'agent' && contextUser.role !== 'super_admin') {
        return c.json({ success: false, message: "Forbidden: Only Agents can view referrals" }, 403);
    }

    try {
        const list = await db.select({
            id: users.id,
            userId: users.userId,
            fullName: profiles.fullName,
            whatsapp: profiles.whatsapp,
            joinedAt: users.createdAt,
            pointsBalance: users.pointsBalance
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(profiles.referredByAgentId, contextUser.userId))
            .orderBy(desc(users.createdAt));

        return c.json({
            success: true,
            data: list
        });

    } catch (error) {
        console.error("Referrals Error:", error);
        return c.json({ success: false, message: "Failed to fetch referrals" }, 500);
    }
});

/**
 * @route   POST /api/v1/user/daily-checkin
 * @desc    Manual daily bonus trigger from dashboard
 * @access  Private (User)
 */
user.post('/daily-checkin', async (c) => {
    const contextUser = c.get('user');
    if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);

    try {
        const result = await PointsService.processDailyLogin(contextUser.id);

        if (result.awarded) {
            return c.json({
                success: true,
                awarded: true,
                points: result.points,
                message: `+${result.points} Poin Harian berhasil diklaim!`
            });
        }

        return c.json({
            success: true,
            awarded: false,
            points: 0,
            message: "Poin harian sudah diklaim hari ini."
        });

    } catch (error) {
        console.error("Daily Check-in Error:", error);
        return c.json({ success: false, message: "Failed to process daily check-in" }, 500);
    }
});

/**
 * @route   POST /api/v1/user/dev-reset-daily
 * @desc    RESET daily bonus status (DEV ONLY)
 * @access  Private (User)
 */
user.post('/dev-reset-daily', async (c) => {
    const contextUser = c.get('user');
    if (!contextUser) return c.json({ success: false, message: "Unauthorized" }, 401);

    try {
        await PointsService.resetDailyLogin(contextUser.id);
        return c.json({
            success: true,
            message: "Daily check-in status reset. You can now claim again."
        });
    } catch (error) {
        console.error("Dev Reset Error:", error);
        return c.json({ success: false, message: "Failed to reset daily status" }, 500);
    }
});

export default user;
