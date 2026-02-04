import { Hono } from 'hono';
import { db, users, pointsBalance, pointsLedger, referrals, agents } from '@repo/database';
import { eq, desc } from 'drizzle-orm';

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

        return c.json({
            success: true,
            data: {
                ...userData,
                points: userData.points || 0
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
        const history = await db.select()
            .from(pointsLedger)
            .where(eq(pointsLedger.userId, userData.id))
            .orderBy(desc(pointsLedger.createdAt))
            .limit(20);

        return c.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error("Activity Error:", error);
        return c.json({ success: false, message: "Failed to fetch activity" }, 500);
    }
});

export default user;
