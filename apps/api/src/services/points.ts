import { db, users, pointsLedger, loginLogs } from '@repo/database';
import { eq, sql, and } from 'drizzle-orm';

export const PointsService = {
    /**
     * Add points to a user and record it in the ledger.
     * Supports running within an existing transaction.
     */
    async addPoints(userId: string, amount: number, source: string, description: string, tx?: any) {
        const operation = async (transaction: any) => {
            // 1. Update User Balance
            await transaction.update(users)
                .set({ pointsBalance: sql`${users.pointsBalance} + ${amount}` })
                .where(eq(users.id, userId));

            // 2. Add to Ledger
            await transaction.insert(pointsLedger).values({
                userId,
                amount,
                source,
                description,
                createdAt: new Date(),
            });
        };

        if (tx) {
            await operation(tx);
        } else {
            await db.transaction(operation);
        }
    },

    /**
     * Recalculate user balance from the ledger and update the users table.
     * Useful for synchronization or fixing discrepancies.
     */
    async updateUserBalance(userId: string) {
        await db.transaction(async (tx) => {
            const [result] = await tx
                .select({ total: sql<number>`cast(coalesce(sum(${pointsLedger.amount}), 0) as int)` })
                .from(pointsLedger)
                .where(eq(pointsLedger.userId, userId));

            const total = result?.total || 0;

            await tx.update(users)
                .set({ pointsBalance: total })
                .where(eq(users.id, userId));
        });
    },

    /**
     * Process daily login for a user.
     * Checks if user has logged in today, if not, awards daily points.
     */
    async processDailyLogin(userId: string) {
        const today = new Date().toISOString().split('T')[0] as string; // YYYY-MM-DD

        return await db.transaction(async (tx) => {
            // Check logs for today
            const [existing] = await tx.select()
                .from(loginLogs)
                .where(and(
                    eq(loginLogs.userId, userId),
                    eq(loginLogs.loginDate, today)
                ))
                .limit(1);

            if (!existing) {
                // Insert Log
                await tx.insert(loginLogs).values({
                    userId,
                    loginDate: today
                });

                // Add Points (using local logic to ensure same transaction)
                await tx.update(users)
                    .set({ pointsBalance: sql`${users.pointsBalance} + 10` })
                    .where(eq(users.id, userId));

                await tx.insert(pointsLedger).values({
                    userId,
                    amount: 10,
                    source: 'daily',
                    description: 'Daily Login Bonus',
                    createdAt: new Date(),
                });

                return { awarded: true, points: 10 };
            }

            return { awarded: false, points: 0 };
        });
    },

    /**
     * Check if a user has already claimed their daily bonus for today.
     */
    async isClaimedToday(userId: string): Promise<boolean> {
        const today = new Date().toISOString().split('T')[0] as string;
        const [existing] = await db.select()
            .from(loginLogs)
            .where(and(
                eq(loginLogs.userId, userId),
                eq(loginLogs.loginDate, today)
            ))
            .limit(1);

        return !!existing;
    },

    /**
     * RESET daily login status for development/testing.
     * Deletes the log for today so the user can claim again.
     */
    async resetDailyLogin(userId: string) {
        const today = new Date().toISOString().split('T')[0] as string;
        await db.delete(loginLogs)
            .where(and(
                eq(loginLogs.userId, userId),
                eq(loginLogs.loginDate, today)
            ));
    }
};
