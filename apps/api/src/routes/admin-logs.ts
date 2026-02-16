import { Hono } from 'hono';
import { db, adminActions, users, profiles } from '@repo/database';
import { eq, desc, and, sql } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

type Env = {
    Variables: {
        user: {
            id: string;
            role: string;
            userId: string;
        };
    };
};

const adminLogs = new Hono<Env>();

// Apply Strict RBAC Middleware - Only Admins can access
adminLogs.use('*', rbacMiddleware());

/**
 * @route   GET /admin/logs
 * @desc    Get admin activity logs (including logins)
 * @access  Super Admin, Admin View
 */
adminLogs.get('/logs', async (c) => {
    const limit = Number(c.req.query('limit')) || 100;
    const type = c.req.query('type'); // Filter by action type (e.g., 'LOGIN')
    const target = c.req.query('target') || 'admin'; // 'admin' or 'user'

    try {
        let query;

        if (target === 'user') {
            const { userActivityLogs } = await import('@repo/database');

            query = db.select({
                id: userActivityLogs.id,
                userId: userActivityLogs.userId,
                userName: profiles.fullName,
                userRole: users.role,
                action: userActivityLogs.action,
                details: userActivityLogs.details,
                ipAddress: userActivityLogs.ipAddress,
                userAgent: userActivityLogs.userAgent,
                createdAt: userActivityLogs.createdAt,
            })
                .from(userActivityLogs)
                .leftJoin(users, eq(userActivityLogs.userId, users.id))
                .leftJoin(profiles, eq(users.id, profiles.userId))
                .orderBy(desc(userActivityLogs.createdAt))
                .limit(limit);

            if (type) {
                //@ts-ignore
                query.where(eq(userActivityLogs.action, type));
            }

        } else {
            // Default: Admin Logs
            query = db.select({
                id: adminActions.id,
                adminId: adminActions.adminId, // key matches frontend expected 'adminId' or we map it? frontend expects 'adminName'
                adminName: profiles.fullName,
                adminRole: users.role,
                action: adminActions.action,
                details: adminActions.details,
                ipAddress: adminActions.ipAddress,
                userAgent: adminActions.userAgent,
                createdAt: adminActions.createdAt,
            })
                .from(adminActions)
                .leftJoin(users, eq(adminActions.adminId, users.id))
                .leftJoin(profiles, eq(users.id, profiles.userId))
                .orderBy(desc(adminActions.createdAt))
                .limit(limit);

            if (type) {
                //@ts-ignore
                query.where(eq(adminActions.action, type));
            }
        }

        const logs = await query;
        return c.json({ success: true, data: logs });
    } catch (error) {
        console.error("Fetch Logs Error:", error);
        return c.json({ success: false, message: "Failed to fetch logs" }, 500);
    }
});

export default adminLogs;
