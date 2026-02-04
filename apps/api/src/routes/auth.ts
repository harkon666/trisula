import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RegisterUserSchema } from '@repo/shared';
import { db, users, pointsBalance, agents, referrals } from '@repo/database';
import { eq } from 'drizzle-orm';
import { BlockchainService } from '../services/blockchain';

const auth = new Hono();

/**
 * @route   POST /auth/register
 * @desc    Pendaftaran nasabah baru + Inisialisasi saldo
 */
auth.post('/register', zValidator('json', RegisterUserSchema), async (c) => {
    const { name, email, password, phone, city, walletAddress, referralCode } = c.req.valid('json');

    try {
        // 1. Resolve Agent Address from Referral Code
        let agentWalletAddress = "0x0000000000000000000000000000000000000000"; // Default / Null address
        let agentData: { id: string; userId: string; walletAddress: string | null; } | undefined;

        if (referralCode) {
            // Find agent by referral code using explicit JOIN
            const [fetchedAgent] = await db.select({
                id: agents.id,
                userId: agents.userId,
                walletAddress: users.walletAddress
            })
                .from(agents)
                .leftJoin(users, eq(agents.userId, users.id))
                .where(eq(agents.referralCode, referralCode))
                .limit(1);

            agentData = fetchedAgent;

            if (agentData && agentData.walletAddress) {
                agentWalletAddress = agentData.walletAddress;
            } else {
                console.warn(`Referral code ${referralCode} not found or agent has no wallet.`);
            }
        }

        // 2. Hash password (or generate random if Smart Onboarding)
        const passwordToHash = password || crypto.randomUUID();
        const passwordHash = await Bun.password.hash(passwordToHash, {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 2,
        });

        // 3. Transaction: User & Balance harus dibuat bersamaan
        const result = await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values({
                name,
                email,
                passwordHash,
                phone,
                city,
                walletAddress,
                role: 'user',
                status: 'active',
            }).returning();

            // Bind to blockchain if agent exists/valid
            // Requirement: "Hubungan referral harus terkunci".
            if (agentData && agentData.id && agentWalletAddress !== "0x0000000000000000000000000000000000000000") {
                try {
                    // Add 5s timeout to prevent hanging backend if blockchain is stuck
                    const bindPromise = BlockchainService.bindReferral(
                        walletAddress,
                        agentWalletAddress
                    );

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Blockchain timeout")), 5000)
                    );

                    const receipt: any = await Promise.race([bindPromise, timeoutPromise]);

                    // Simpan history referral ke database
                    if (receipt) {
                        await tx.insert(referrals).values({
                            userId: newUser.id,
                            agentId: agentData.id,
                            txHash: receipt.hash,
                            blockNumber: receipt.blockNumber,
                        });
                    }

                } catch (bcError) {
                    console.error("Blockchain binding passed/failed (Non-blocking):", bcError);
                    // PRD: "Event-based Ledger". "Result txHash disimpan di Supabase".
                    // Continuing without failing the user registration, but logging the error.
                    // If timeout, user is still registered.
                }
            }

            await tx.insert(pointsBalance).values({
                userId: newUser.id,
                balance: 0,
            });

            return newUser;
        });



        // 3. Bersihkan data sensitif dari response
        const { passwordHash: _, ...userResponse } = result;

        return c.json({
            success: true,
            message: "Nasabah berhasil terdaftar",
            data: userResponse
        }, 201);

    } catch (error: any) {
        console.error("Auth Error:", error);

        if (error.message?.includes('users_email_unique')) {
            return c.json({ success: false, message: "Email sudah terdaftar" }, 400);
        }

        return c.json({ success: false, message: "Gagal memproses pendaftaran" }, 500);
    }
});

export default auth;