import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RegisterUserSchema } from '@repo/shared';
import { db, users, pointsBalance, agents } from '@repo/database';
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

        if (referralCode) {
            // Find agent by referral code using explicit JOIN
            const [agentData] = await db.select({
                walletAddress: users.walletAddress
            })
                .from(agents)
                .leftJoin(users, eq(agents.userId, users.id))
                .where(eq(agents.referralCode, referralCode))
                .limit(1);

            if (agentData && agentData.walletAddress) {
                agentWalletAddress = agentData.walletAddress;
            } else {
                console.warn(`Referral code ${referralCode} not found or agent has no wallet.`);
            }
        }

        // 2. Hash password dengan Argon2id (Standar emas 2026)
        const passwordHash = await Bun.password.hash(password, {
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
            // Note: bindReferral might need to handle 0x0 address if allow no referral?
            // Or only bind if agentWalletAddress != 0x0...
            // Assuming bindReferral handles it or we only call if valid.
            // Requirement: "Hubungan referral harus terkunci".
            if (agentWalletAddress !== "0x0000000000000000000000000000000000000000") {
                try {
                    const receipt = await BlockchainService.bindReferral(
                        walletAddress,
                        agentWalletAddress
                    );

                    // TODO: Simpan txHash ke tabel referrals (Requirement Phase 2)
                    // But 'referrals' table needs agentId. We need agentRecord.id.
                    // This implies we loop back or have agentId available.

                } catch (bcError) {
                    console.error("Blockchain binding failed:", bcError);
                    // Don't rollback user creation? Or rollback? 
                    // PRD: "Event-based Ledger". "Result txHash disimpan di Supabase".
                    // If blockchain fails, maybe we should warn but allow user creation?
                    // For now, let's log error but proceed, or throw to rollback if critical.
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