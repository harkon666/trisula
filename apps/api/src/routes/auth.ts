import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, users, profiles, agentActivationCodes, adminActions, pointsLedger } from '@repo/database';
import { eq, and, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { PointsService } from '../services/points.js';

const auth = new Hono();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_key_change_me');

// --- Schemas ---
const RegisterAgentSchema = z.object({
    userId: z.string().min(4),
    password: z.string().min(6),
    fullName: z.string().min(2),
    whatsapp: z.string().min(10),
    activationCode: z.string().min(5),
});

const RegisterNasabahSchema = z.object({
    userId: z.string().min(4),
    password: z.string().min(6),
    fullName: z.string().min(2),
    whatsapp: z.string().min(10),
    referredByAgentId: z.string().min(4), // User ID of the agent
});

const LoginSchema = z.object({
    userId: z.string(),
    password: z.string(),
});

/**
 * @route   POST /auth/register/agent
 * @desc    Registrasi Agent dengan Kode Aktivasi
 */
auth.post('/register/agent', zValidator('json', RegisterAgentSchema), async (c) => {
    const { userId, password, fullName, whatsapp, activationCode } = c.req.valid('json');

    try {
        return await db.transaction(async (tx) => {
            // 1. Validate Activation Code
            const [code] = await tx.select()
                .from(agentActivationCodes)
                .where(and(
                    eq(agentActivationCodes.code, activationCode),
                    eq(agentActivationCodes.isUsed, false)
                ))
                .limit(1);

            if (!code) {
                return c.json({ success: false, message: "Kode aktivasi tidak valid atau sudah digunakan" }, 400);
            }

            // 2. Check User ID Uniqueness
            const [existingUser] = await tx.select().from(users).where(eq(users.userId, userId)).limit(1);
            if (existingUser) {
                return c.json({ success: false, message: "User ID sudah digunakan" }, 400);
            }

            // 3. Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 4. Create User
            const [newUser] = await tx.insert(users).values({
                userId,
                password: hashedPassword,
                role: 'agent',
                isActive: true, // Agent active after valid code
            }).returning();

            if (!newUser) throw new Error("Failed to create user");

            // 5. Create Profile
            await tx.insert(profiles).values({
                userId: newUser.id,
                fullName,
                whatsapp,
            });

            // 6. Mark Code as Used
            await tx.update(agentActivationCodes)
                .set({ isUsed: true, usedBy: newUser.id })
                .where(eq(agentActivationCodes.id, code.id));

            // 7. Log Admin Action (System)
            await tx.insert(adminActions).values({
                action: 'AGENT_REGISTER',
                details: { userId, code: activationCode },
                createdAt: new Date(),
            });

            // 8. Generate JWT for Auto-Login
            const token = await new SignJWT({
                sub: newUser.id,
                role: newUser.role,
                userId: newUser.userId
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(JWT_SECRET);

            return c.json({
                success: true,
                message: "Agent berhasil terdaftar",
                token,
                user: {
                    userId: newUser.userId,
                    role: newUser.role,
                    pointsBalance: 0 // New agents start with 0
                }
            }, 201);
        });
    } catch (error) {
        console.error("Agent Register Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /auth/register/nasabah
 * @desc    Registrasi Nasabah dengan Referral Agent
 */
auth.post('/register/nasabah', zValidator('json', RegisterNasabahSchema), async (c) => {
    const { userId, password, fullName, whatsapp, referredByAgentId } = c.req.valid('json');

    try {
        return await db.transaction(async (tx) => {
            // 1. Validate Agent existence
            const [agent] = await tx.select().from(users)
                .where(and(eq(users.userId, referredByAgentId), eq(users.role, 'agent')))
                .limit(1);

            if (!agent) {
                return c.json({ success: false, message: "Agent Referral ID tidak ditemukan" }, 400);
            }

            // 2. Check User ID Uniqueness
            const [existingUser] = await tx.select().from(users).where(eq(users.userId, userId)).limit(1);
            if (existingUser) {
                return c.json({ success: false, message: "User ID sudah digunakan" }, 400);
            }

            // 3. Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 4. Create User (Nasabah)
            const [newUser] = await tx.insert(users).values({
                userId,
                password: hashedPassword,
                role: 'nasabah',
                isActive: true,
            }).returning();

            if (!newUser) throw new Error("Failed to create user");

            // 5. Create Profile with Referral
            await tx.insert(profiles).values({
                userId: newUser.id,
                fullName,
                whatsapp,
                referredByAgentId: agent.userId, // Store Agent User ID
            });

            // 6. Welcome Bonus (+100 Points)
            // Using PointsService logic inline or imported helper?
            // Since we differ tx context, let's do it manually or assume PointsService can handle external tx if we refactor it slightly to accept tx.
            // PointsService.addPoints supports tx!
            await PointsService.addPoints(newUser.id, 100, 'welcome', 'Welcome Bonus Nasabah', tx);

            // 7. Log Admin Action
            await tx.insert(adminActions).values({
                action: 'NASABAH_REGISTER',
                details: { userId, referredBy: referredByAgentId },
                createdAt: new Date(),
            });

            // 8. Generate JWT for Auto-Login
            const token = await new SignJWT({
                sub: newUser.id,
                role: newUser.role,
                userId: newUser.userId
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(JWT_SECRET);

            return c.json({
                success: true,
                message: "Nasabah berhasil terdaftar",
                token,
                user: {
                    userId: newUser.userId,
                    role: newUser.role,
                    pointsBalance: 50 // Nasabah gets welcome bonus
                }
            }, 201);
        });
    } catch (error) {
        console.error("Nasabah Register Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /auth/login
 * @desc    Login dengan User ID & Password + Daily Bonus Check
 */
auth.post('/login', zValidator('json', LoginSchema), async (c) => {
    const { userId, password } = c.req.valid('json');

    try {
        console.log(`[LOGIN ATTEMPT] userId: '${userId}'`);

        // 1. Find User by ID or Email
        const [userWithProfile] = await db.select({
            user: users,
            profile: profiles
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(or(
                eq(users.userId, userId),
                eq(profiles.email, userId)
            ))
            .limit(1);

        if (!userWithProfile) {
            console.log(`[LOGIN FAILED] User/Email not found: '${userId}'`);
            return c.json({ success: false, message: "User ID/Email atau Password salah" }, 401);
        }

        const user = userWithProfile.user;

        console.log(`[LOGIN FOUND] User: ${user.userId}, Role: ${user.role}, Active: ${user.isActive}`);
        console.log(`[LOGIN AUTH] Verifying password... stored hash: ${user.password.substring(0, 10)}...`);

        // 2. Verify Password
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN RESULT] Password Valid: ${isValid}`);

        if (!isValid) {
            return c.json({ success: false, message: "User ID/Email atau Password salah" }, 401);
        }

        if (!user.isActive) {
            return c.json({ success: false, message: "Akun belum aktif" }, 403);
        }

        // 3. Daily Bonus Check
        const dailyBonus = await PointsService.processDailyLogin(user.id);
        const dailyMessage = dailyBonus.awarded ? " + 10 Poin Harian!" : "";

        // 4. Generate JWT (Jose)
        const token = await new SignJWT({
            sub: user.id,
            role: user.role,
            userId: user.userId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h') // 1 Day Session
            .sign(JWT_SECRET);

        return c.json({
            success: true,
            message: `Login berhasil${dailyMessage}`,
            token,
            user: {
                userId: user.userId,
                role: user.role,
                points: user.pointsBalance + (dailyBonus.awarded ? 10 : 0) // Reflect updated balance if bonus awarded
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default auth;