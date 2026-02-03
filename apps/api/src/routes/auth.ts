import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RegisterUserSchema } from '@repo/shared';
import { db, users, pointsBalance } from '@repo/database';

const auth = new Hono();

/**
 * @route   POST /auth/register
 * @desc    Pendaftaran nasabah baru + Inisialisasi saldo
 */
auth.post('/register', zValidator('json', RegisterUserSchema), async (c) => {
    const { name, email, password, phone, city } = c.req.valid('json');

    try {
        // 1. Hash password dengan Argon2id (Standar emas 2026)
        const passwordHash = await Bun.password.hash(password, {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 2,
        });

        // 2. Transaction: User & Balance harus dibuat bersamaan
        const result = await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values({
                name,
                email,
                passwordHash,
                phone,
                city,
                role: 'user',
                status: 'active',
            }).returning();

            const receipt = await BlockchainService.bindReferral(
                payload.walletAddress,
                payload.agentAddress
            );

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