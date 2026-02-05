import { Hono } from 'hono';
import { db, users, pointsBalance, pointsLedger, referrals, agents, redeemCatalog, redeemRequests } from '@repo/database';
import { eq, desc, sql } from 'drizzle-orm';
import { RewardService } from '../services/RewardService';

const user = new Hono();

/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile and points balance
 * @query   walletAddress
 */
user.get('/profile', async (c) => {
    const walletAddress = c.req.query('walletAddress');

    if (!walletAddress) {
        return c.json({ success: false, message: "Wallet address required" }, 400);
    }

    try {
        // 1. Get User ID first to trigger Lazy Yield
        const userShort = await db.query.users.findFirst({
            where: eq(users.walletAddress, walletAddress),
            columns: { id: true }
        });

        let yieldResult = null;
        if (userShort) {
            yieldResult = await RewardService.checkAndClaimYield(userShort.id);
        }

        // 2. Fetch Full Profile (including updated points)
        const [userData] = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            walletAddress: users.walletAddress,
            role: users.role,
            status: users.status,
            referralCode: agents.referralCode,
            points: pointsBalance.balance
        })
            .from(users)
            .leftJoin(pointsBalance, eq(users.id, pointsBalance.userId))
            .leftJoin(agents, eq(users.id, agents.userId))
            .where(eq(users.walletAddress, walletAddress))
            .limit(1);

        if (!userData) {
            return c.json({ success: false, message: "User not found" }, 404);
        }

        // 3. Get Wealth Stats for Dashboard (Net Worth & Estimated Yield)
        // We reuse the calculation logic (it reads DB + Mock Price)
        const wealthStats = await RewardService.calculateDailyYield(userData.id);

        return c.json({
            success: true,
            data: {
                ...userData,
                points: userData.points || 0,
                dailyYield: yieldResult,
                wealth: {
                    totalAum: wealthStats.totalAum,
                    estimatedYield: wealthStats.finalPoints,
                    tier: wealthStats.tier
                }
            }
        });

    } catch (error) {
        console.error("Profile Error:", error);
        return c.json({ success: false, message: "Failed to fetch profile" }, 500);
    }
});

/**
 * @route   GET /api/v1/user/activity
 * @desc    Get points history and referrals
 * @query   walletAddress
 */
user.get('/activity', async (c) => {
    const walletAddress = c.req.query('walletAddress');

    if (!walletAddress) {
        return c.json({ success: false, message: "Wallet address required" }, 400);
    }

    try {
        const [userData] = await db.select({ id: users.id }).from(users).where(eq(users.walletAddress, walletAddress)).limit(1);

        if (!userData) {
            return c.json({ success: false, message: "User not found" }, 404);
        }

        // Fetch Points Ledger (History)
        const history = await db.select({
            id: pointsLedger.id,
            amount: pointsLedger.amount,
            reason: pointsLedger.reason,
            source: pointsLedger.source,
            txHash: pointsLedger.txHash,
            createdAt: pointsLedger.createdAt,
            status: sql<string>`NULL` // Placeholder for status
        })
            .from(pointsLedger)
            .where(eq(pointsLedger.userId, userData.id))
            .orderBy(desc(pointsLedger.createdAt))
            .limit(30);

        // Fetch Redeem Requests to get statuses
        const redemptions = await db.select({
            reason: sql<string>`CONCAT('Redeem: ', ${redeemCatalog.name})`,
            status: redeemRequests.status,
            createdAt: redeemRequests.createdAt
        })
            .from(redeemRequests)
            .leftJoin(redeemCatalog, eq(redeemRequests.rewardId, redeemCatalog.id))
            .where(eq(redeemRequests.userId, userData.id));

        // Map status back to history by matching reason AND closest timestamp
        const mergedHistory = history.map(item => {
            // Refund entries get special 'refund' status
            if (item.reason.startsWith('Refund:')) {
                return { ...item, status: 'refund' };
            }

            if (item.source === 'redeem') {
                // Find redemption with same reason AND closest createdAt
                const matchingRedemptions = redemptions.filter(r => r.reason === item.reason);

                if (matchingRedemptions.length === 0) {
                    return { ...item, status: 'pending' };
                }

                // Find the one with closest timestamp (within 5 seconds tolerance)
                const itemTime = new Date(item.createdAt).getTime();
                const closest = matchingRedemptions.reduce((prev, curr) => {
                    const prevDiff = Math.abs(new Date(prev.createdAt).getTime() - itemTime);
                    const currDiff = Math.abs(new Date(curr.createdAt).getTime() - itemTime);
                    return currDiff < prevDiff ? curr : prev;
                });

                return { ...item, status: closest.status };
            }
            return item;
        });

        return c.json({
            success: true,
            data: mergedHistory
        });

    } catch (error) {
        console.error("Activity Error:", error);
        return c.json({ success: false, message: "Failed to fetch activity" }, 500);
    }
});

export default user;
