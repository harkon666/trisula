import { Hono } from 'hono';
import { db, users, redeemRequests, polisData, pointsLedger, adminActions } from '@repo/database';
import { eq, count, sql, desc } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';

const dashboardRoute = new Hono<{ Variables: { user: AuthUser } }>();

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get Aggregated Stats for Admin Dashboard
 * @access  Admin View, Super Admin
 */
dashboardRoute.get('/stats', rbacMiddleware(), async (c) => {
    // RBAC check is done by middleware, but ensure it's admin
    const user = c.get('user');
    // If we want stricter check for "Admin View" specifically or allow all admins:
    // rbacMiddleware allows "admin_view" and "super_admin" for GET.

    try {
        // Parallel Usage for Performance
        const [
            userCount,
            redeemPendingCount,
            polisCount,
            totalPointsDistributed
        ] = await Promise.all([
            // 1. Total Users
            db.select({ count: count() }).from(users),

            // 2. Pending Redeems
            db.select({ count: count() }).from(redeemRequests).where(eq(redeemRequests.status, 'pending')),

            // 3. Total Polis
            db.select({ count: count() }).from(polisData),

            // 4. Total Points (Approximation from Ledger where amount > 0)
            // or sum of all user points? Let's do sum of current user points
            db.select({ total: sql<number>`sum(${users.pointsBalance})` }).from(users)
        ]);

        // 5. Recent Admin Actions (Audit Log)
        const recentActions = await db.select()
            .from(adminActions)
            .orderBy(desc(adminActions.createdAt))
            .limit(5);

        return c.json({
            success: true,
            data: {
                totalUsers: userCount[0]?.count || 0,
                pendingRedemptions: redeemPendingCount[0]?.count || 0,
                totalPolis: polisCount[0]?.count || 0,
                outstandingPoints: totalPointsDistributed[0]?.total || 0,
                recentActivity: recentActions
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default dashboardRoute;
