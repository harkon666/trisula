import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, users, profiles, agentActivationCodes, adminActions, pointsLedger, userActivityLogs } from '@repo/database';
import { eq, and, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { PointsService } from '../services/points.js';
import { sendVerificationEmail } from '../services/email.js';
import { randomBytes } from 'crypto';

const auth = new Hono();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_key_change_me');

// Helper: Convert Indonesian WhatsApp number from 0xx to 62xx format
function normalizeWhatsApp(whatsapp: string): string {
    if (whatsapp.startsWith('0')) {
        return '62' + whatsapp.slice(1);
    }
    return whatsapp;
}

// --- Schemas ---
const RegisterAgentSchema = z.object({
    password: z.string().min(6),
    fullName: z.string().min(2),
    email: z.string().email("Email tidak valid"),
    whatsapp: z.string().min(10),
    activationCode: z.string().min(5),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal salah (YYYY-MM-DD)"),
});

const RegisterNasabahSchema = z.object({
    password: z.string().min(6),
    fullName: z.string().min(2),
    email: z.string().email("Email tidak valid"),
    whatsapp: z.string().min(10),
    referredByAgentId: z.string().min(4), // User ID of the agent
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal salah (YYYY-MM-DD)"),
});

const LoginSchema = z.object({
    userId: z.string(),
    password: z.string(),
});

/**
 * @route   POST /auth/register/agent
 * @desc    Registrasi Agent dengan Kode Aktivasi - Wajib Verifikasi Email
 */
auth.post('/register/agent', zValidator('json', RegisterAgentSchema), async (c) => {
    const { password, fullName, email, whatsapp, activationCode, dateOfBirth } = c.req.valid('json');
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const normalizedWhatsApp = normalizeWhatsApp(whatsapp);

    const userId = activationCode; // Use activation code as userId

    try {
        // 1. Validate Activation Code
        const [code] = await db.select()
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
        const [existingUser] = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
        if (existingUser) {
            return c.json({ success: false, message: "User ID sudah digunakan" }, 400);
        }

        // 3. Check Email Uniqueness (in profiles)
        const [existingProfile] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
        if (existingProfile) {
            return c.json({ success: false, message: "Email sudah terdaftar" }, 400);
        }

        // 4. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Generate Email Verification Token (24h expiry)
        const verificationToken = randomBytes(32).toString('hex');
        const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 6. Create User (NOT active until email verified)
        const [newUser] = await db.insert(users).values({
            userId,
            password: hashedPassword,
            role: 'agent',
            isActive: false, // Agent NOT active until email verified
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiresAt: verificationExpiresAt,
        }).returning();

        if (!newUser) throw new Error("Failed to create user");

        // 7. Create Profile
        await db.insert(profiles).values({
            userId: newUser.id,
            fullName,
            email,
            whatsapp: normalizedWhatsApp,
            dateOfBirth,
        });

        // 8. Mark Code as Used
        await db.update(agentActivationCodes)
            .set({ isUsed: true, usedBy: newUser.id })
            .where(eq(agentActivationCodes.id, code.id));

        // 9. Log Admin Action (System)
        await db.insert(adminActions).values({
            action: 'AGENT_REGISTER_PENDING_VERIFICATION',
            details: { userId, code: activationCode },
            createdAt: new Date(),
        });

        // 10. Send Verification Email (async - don't fail if email fails)
        sendVerificationEmail({
            email,
            fullName,
            verificationToken,
            baseUrl,
        }).catch((emailError) => {
            console.error('[AUTH] Failed to send verification email:', emailError);
        });

        return c.json({
            success: true,
            message: "Agent berhasil terdaftar. Silakan verifikasi email Anda sebelum login.",
            requiresEmailVerification: true,
            user: {
                userId: newUser.userId,
                role: newUser.role,
            }
        }, 201);

    } catch (error) {
        console.error("Agent Register Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /auth/verify-email
 * @desc    Verifikasi Email dengan Token
 */
auth.get('/verify-email', async (c) => {
    const token = c.req.query('token');

    if (!token) {
        return c.json({ success: false, message: "Token verifikasi tidak ditemukan" }, 400);
    }

    try {
        // Find user by verification token
        const [user] = await db.select({
            id: users.id,
            userId: users.userId,
            email: profiles.email,
            fullName: profiles.fullName,
            isEmailVerified: users.isEmailVerified,
            emailVerificationExpiresAt: users.emailVerificationExpiresAt,
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.emailVerificationToken, token))
            .limit(1);

        if (!user) {
            return c.json({ success: false, message: "Token verifikasi tidak valid" }, 400);
        }

        if (user.isEmailVerified) {
            return c.json({ success: false, message: "Email sudah terverifikasi sebelumnya" }, 400);
        }

        // Check if token expired
        if (user.emailVerificationExpiresAt && new Date(user.emailVerificationExpiresAt) < new Date()) {
            return c.json({ success: false, message: "Token verifikasi sudah kadaluarsa. Silakan minta token baru." }, 400);
        }

        // Update user: set email verified, clear token, set active
        await db.update(users)
            .set({
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpiresAt: null,
                isActive: true,
            })
            .where(eq(users.id, user.id));

        // Log action
        await db.insert(adminActions).values({
            action: 'EMAIL_VERIFIED',
            details: { userId: user.userId },
            createdAt: new Date(),
        });

        return c.json({
            success: true,
            message: "Email berhasil diverifikasi! Anda sekarang dapat login.",
        });

    } catch (error) {
        console.error("Verify Email Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /auth/resend-verification
 * @desc    Kirim Ulang Email Verifikasi
 */
auth.post('/resend-verification', zValidator('json', z.object({
    email: z.string().email("Email tidak valid"),
})), async (c) => {
    const { email } = c.req.valid('json');
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
        // Find user by email in profiles
        const [userWithProfile] = await db.select({
            user: users,
            profile: profiles,
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(profiles.email, email))
            .limit(1);

        if (!userWithProfile) {
            // Don't reveal if email exists or not for security
            return c.json({ success: true, message: "Jika email terdaftar, link verifikasi telah dikirim." });
        }

        const user = userWithProfile.user;
        const profile = userWithProfile.profile;

        // Only agents need email verification
        if (user.role !== 'agent') {
            return c.json({ success: false, message: "Akun ini tidak memerlukan verifikasi email" }, 400);
        }

        // If already verified, tell them
        if (user.isEmailVerified) {
            return c.json({ success: false, message: "Email sudah terverifikasi. Silakan login." }, 400);
        }

        // Generate new verification token
        const verificationToken = randomBytes(32).toString('hex');
        const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.update(users)
            .set({
                emailVerificationToken: verificationToken,
                emailVerificationExpiresAt: verificationExpiresAt,
            })
            .where(eq(users.id, user.id));

        // Send new verification email
        await sendVerificationEmail({
            email,
            fullName: profile?.fullName || 'User',
            verificationToken,
            baseUrl,
        });

        return c.json({ success: true, message: "Link verifikasi telah dikirim ulang ke email Anda." });

    } catch (error) {
        console.error("Resend Verification Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /auth/register/nasabah
 * @desc    Registrasi Nasabah dengan Referral Agent
 */
auth.post('/register/nasabah', zValidator('json', RegisterNasabahSchema), async (c) => {
    const { password, fullName, email, whatsapp, referredByAgentId, dateOfBirth } = c.req.valid('json');
    const normalizedWhatsApp = normalizeWhatsApp(whatsapp);

    try {
        // 1. Validate Agent existence
        const [agent] = await db.select().from(users)
            .where(and(eq(users.userId, referredByAgentId), eq(users.role, 'agent')))
            .limit(1);

        if (!agent) {
            return c.json({ success: false, message: "Agent Referral ID tidak ditemukan" }, 400);
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User (Nasabah)
        const [newUser] = await db.insert(users).values({
            password: hashedPassword,
            role: 'nasabah',
            isActive: true,
        }).returning();

        if (!newUser) throw new Error("Failed to create user");

        // 4. Create Profile with Referral
        await db.insert(profiles).values({
            userId: newUser.id,
            fullName,
            email,
            whatsapp: normalizedWhatsApp,
            referredByAgentId: agent.userId,
            dateOfBirth,
        });

        // 5. Welcome Bonus (+100 Points)
        await PointsService.addPoints(newUser.id, 100, 'welcome', 'Welcome Bonus Nasabah');

        // 6. Log Admin Action
        await db.insert(adminActions).values({
            action: 'NASABAH_REGISTER',
            details: { referredBy: referredByAgentId },
            createdAt: new Date(),
        });

        // 7. Generate JWT for Auto-Login
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
                pointsBalance: 50
            }
        }, 201);

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

        const [userWithProfile] = await db.select({
            user: {
                id: users.id,
                userId: users.userId,
                role: users.role,
                isActive: users.isActive,
                isEmailVerified: users.isEmailVerified,
                password: users.password,
                pointsBalance: users.pointsBalance,
                additionalMetadata: users.additionalMetadata
            },
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

        console.log(`[LOGIN FOUND] User: ${user.userId}, Role: ${user.role}, Active: ${user.isActive}, EmailVerified: ${user.isEmailVerified}`);

        // Verify Password
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN RESULT] Password Valid: ${isValid}`);

        if (!isValid) {
            return c.json({ success: false, message: "User ID/Email atau Password salah" }, 401);
        }

        // Check if account is active
        if (!user.isActive) {
            return c.json({ success: false, message: "Akun belum aktif. Silakan verifikasi email terlebih dahulu." }, 403);
        }

        // Check email verification for agents
        if (user.role === 'agent' && !user.isEmailVerified) {
            return c.json({
                success: false,
                message: "Email belum diverifikasi. Silakan verifikasi email terlebih dahulu.",
                requiresEmailVerification: true,
            }, 403);
        }

        // Daily Bonus Check
        const dailyBonus = await PointsService.processDailyLogin(user.id);
        const dailyMessage = dailyBonus.awarded ? " + 10 Poin Harian!" : "";

        // Log Login
        const ipAddress = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';
        const userAgent = c.req.header('user-agent');

        if (['admin', 'super_admin'].includes(user.role)) {
            await db.insert(adminActions).values({
                adminId: user.id,
                action: 'LOGIN',
                details: { method: 'password' },
                ipAddress,
                userAgent,
                createdAt: new Date(),
            });
        } else {
            await db.insert(userActivityLogs).values({
                userId: user.id,
                action: 'LOGIN',
                details: { method: 'password' },
                ipAddress,
                userAgent,
                createdAt: new Date(),
            });
        }

        // Generate JWT
        const token = await new SignJWT({
            sub: user.id,
            role: user.role,
            userId: user.userId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        return c.json({
            success: true,
            message: `Login berhasil${dailyMessage}`,
            token,
            user: {
                userId: user.userId,
                role: user.role,
                points: user.pointsBalance + (dailyBonus.awarded ? 10 : 0),
                additionalMetadata: user.additionalMetadata
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default auth;
