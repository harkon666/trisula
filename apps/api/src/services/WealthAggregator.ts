import { db, fiatAccounts, loyaltyTiers, users } from "@repo/database";
import { eq } from "drizzle-orm";
import { ethers } from "ethers";

// Mock Price Service (1 USDC = Rp 15,500)
const MOCK_USDC_PRICE_IDR = 15500;
const MOCK_ETH_PRICE_IDR = 40000000;

// Tier Configuration (Fallback if DB empty)
const DEFAULT_TIERS = [
    { name: "Bronze", minAum: 0, multiplier: 1.0 },
    { name: "Silver", minAum: 50_000_000, multiplier: 1.2 },
    { name: "Gold", minAum: 250_000_000, multiplier: 1.5 },
    { name: "Platinum", minAum: 1_000_000_000, multiplier: 2.0 },
];

export const WealthAggregatorService = {
    /**
     * Get User's Fiat Balance from Database
     */
    async getFiatBalance(userId: string): Promise<number> {
        const account = await db.query.fiatAccounts.findFirst({
            where: eq(fiatAccounts.userId, userId)
        });
        return account ? parseFloat(account.balance) : 0;
    },

    /**
     * Get User's Crypto Balance from Base Network (Mocked for MVP)
     * In production, this would query the RPC or Indexer.
     */
    async getCryptoBalance(userId: string): Promise<number> {
        // Mock Implementation: Simulate random crypto holdings for demo
        // In real implementation:
        // 1. Get walletAddress from users table
        // 2. Query USDC/ETH balance via ethers provider
        // 3. Convert to IDR

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!user?.walletAddress) return 0;

        // SIMULATION: If wallet address exists, pretend they have 100 USDC + 0.01 ETH
        const usdcBalance = 100;
        const ethBalance = 0.01;

        const totalIdr = (usdcBalance * MOCK_USDC_PRICE_IDR) + (ethBalance * MOCK_ETH_PRICE_IDR);
        return totalIdr;
    },

    /**
     * Calculate Total AUM and Determine Tier
     */
    async calculateWealthProfile(userId: string) {
        const fiatBalance = await this.getFiatBalance(userId);
        const cryptoBalance = await this.getCryptoBalance(userId);
        const totalAum = fiatBalance + cryptoBalance;

        // Determine Tier
        let currentTier = DEFAULT_TIERS[0];
        // Fetch tiers from DB in production (omitted for speed)

        for (const tier of DEFAULT_TIERS) {
            if (totalAum >= tier.minAum) {
                currentTier = tier;
            }
        }

        return {
            userId,
            fiatBalance,
            cryptoBalance,
            totalAum,
            tier: currentTier.name,
            multiplier: currentTier.multiplier,
            nextTier: this.getNextTier(totalAum)
        };
    },

    getNextTier(currentAum: number) {
        for (const tier of DEFAULT_TIERS) {
            if (tier.minAum > currentAum) {
                return {
                    name: tier.name,
                    needed: tier.minAum - currentAum
                };
            }
        }
        return null; // Already top tier
    }
};
