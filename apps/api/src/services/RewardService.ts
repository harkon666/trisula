import { db, users, pointsBalance, pointsLedger, dailyYieldLogs, loyaltyTiers } from "@repo/database";
import { eq, sql, and } from "drizzle-orm";
import { WealthAggregatorService } from "./WealthAggregator";
import { BlockchainService } from "./blockchain";

// Config: 1 Point for every Rp 500,000 kept
const YIELD_DIVISOR = 500000;

export const RewardService = {
    /**
     * Calculate potential yield for a user based on current AUM
     */
    async calculateDailyYield(userId: string) {
        // 1. Get Wealth Profile
        const profile = await WealthAggregatorService.calculateWealthProfile(userId);

        // 2. Base Points = AUM / Divisor
        const basePoints = Math.floor(profile.totalAum / YIELD_DIVISOR);

        // 3. Apply Multiplier
        // Note: profile.multiplier comes from WealthAggregator which uses hardcoded fallback tiers
        // In a real app, we might want to ensure we use DB tiers if available.
        // For now, relying on WealthAggregator's logic is consistent.

        const finalPoints = Math.floor(basePoints * profile.multiplier);

        return {
            userId,
            totalAum: profile.totalAum,
            tier: profile.tier,
            multiplier: profile.multiplier,
            basePoints,
            finalPoints
        };
    },

    /**
     * Distribute Yield to ALL users (Cron Job logic)
     * Warning: In production with millions of users, this needs batching/queues.
     */
    /**
     * Lazy Load Yield Distribution
     * Triggered when user views dashboard/profile
     */
    async checkAndClaimYield(userId: string) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 1. Check if already claimed today
        const existingLog = await db.query.dailyYieldLogs.findFirst({
            where: and(
                eq(dailyYieldLogs.userId, userId),
                eq(dailyYieldLogs.date, today)
            )
        });

        if (existingLog) {
            return { claimed: false, reason: 'Already claimed today' };
        }

        // 2. Calculate Yield
        const yieldData = await this.calculateDailyYield(userId);

        if (yieldData.finalPoints <= 0) {
            return { claimed: false, reason: 'Zero points earned' };
        }

        // 3. Get User info for Blockchain Log
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { walletAddress: true }
        });

        let txHash = null;

        // 4. Blockchain Logging (Best Effort)
        if (user?.walletAddress) {
            try {
                const tx = await BlockchainService.logPointsAdded(
                    user.walletAddress,
                    BigInt(yieldData.finalPoints),
                    "Daily Yield"
                );
                txHash = tx.hash;
                console.log(`⛓️ On-chain Tx Sent: ${txHash}`);
            } catch (bcError) {
                console.error(`⚠️ On-chain Log Failed for ${userId}:`, bcError);
            }
        }

        // 5. DB Transaction
        await db.transaction(async (tx) => {
            // Update Balance
            await tx.insert(pointsBalance)
                .values({ userId: userId, balance: yieldData.finalPoints })
                .onConflictDoUpdate({
                    target: pointsBalance.userId,
                    set: { balance: sql`${pointsBalance.balance} + ${yieldData.finalPoints}` }
                });

            // Add to Ledger
            await tx.insert(pointsLedger).values({
                userId: userId,
                amount: yieldData.finalPoints,
                source: 'yield',
                reason: `Daily Yield for ${yieldData.tier} Tier (AUM: ${yieldData.totalAum})`,
                txHash: txHash,
            });

            // Log History (Prevent double claim)
            await tx.insert(dailyYieldLogs).values({
                userId: userId,
                date: today,
                totalAum: yieldData.totalAum.toString(),
                yieldEarned: yieldData.finalPoints,
                tierAtTime: yieldData.tier
            });
        });

        console.log(`✅ Yield Claimed for ${userId}: ${yieldData.finalPoints} pts`);
        return { claimed: true, points: yieldData.finalPoints };
    },

};
