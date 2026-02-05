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
     */
    async getCryptoBalance(walletAddress: string): Promise<number> {
        // SIMULATION: If wallet address exists, pretend they have 100 USDC + 0.01 ETH
        // In prod: use ethers provider to check balance of walletAddress
        const usdcBalance = 100;
        const ethBalance = 0.01;

        const totalIdr = (usdcBalance * MOCK_USDC_PRICE_IDR) + (ethBalance * MOCK_ETH_PRICE_IDR);
        return totalIdr;
    },

    /**
     * Calculate Total AUM and Determine Tier by Wallet Address
     */
    async calculateWealthProfileByWallet(walletAddress: string) {
        // 1. Find User by Wallet
        const user = await db.query.users.findFirst({
            where: eq(users.walletAddress, walletAddress)
        });

        if (!user) {
            throw new Error("User not found for this wallet address");
        }

        const fiatBalance = await this.getFiatBalance(user.id);
        const cryptoBalance = await this.getCryptoBalance(walletAddress); // Use wallet directly
        const totalAum = fiatBalance + cryptoBalance;

        // Determine Tier
        let currentTier = DEFAULT_TIERS[0];

        for (const tier of DEFAULT_TIERS) {
            if (totalAum >= tier.minAum) {
                currentTier = tier;
            }
        }

        return {
            userId: user.id,
            walletAddress,
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
