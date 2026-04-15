import { Hono } from 'hono';
import { db, users, profiles, pointsLedger, waInteractions, polisData } from '@repo/database';
import { eq, count, sql, and, desc, gte } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';

const agentRoute = new Hono<{ Variables: { user: AuthUser } }>();

/**
 * @route   GET /api/v1/agent/stats
 * @desc    Get Agent Dashboard Stats
 * @access  Agent
 */
agentRoute.get('/stats', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized: Agent stats only" }, 403);
    }

    try {
        // 1. Total Referrals (Nasabah referred by this agent)
        const [referralCount] = await db.select({ count: count() })
            .from(profiles)
            .where(eq(profiles.referredByAgentId, user.userId)); // Assuming userId from users table matches referredByAgentId text logic. 
        // Note: Schema says referredByAgentId is 'text', users.userId is 'text'. This matches.

        // 2. Total Commission (Points Ledger - Source 'referral' or 'commission'?)
        // Let's assume 'referral_bonus' or similar. 
        // For now, let's sum ALL points earned by this agent, or specific source.
        // Let's filter by source 'referral' and 'commission'.
        // Simplified: Sum of positive entries in pointsLedger for this user.
        const [totalPoints] = await db.select({
            total: sql<number>`sum(${pointsLedger.amount})`
        })
            .from(pointsLedger)
            .where(
                and(
                    eq(pointsLedger.userId, user.id),
                    gte(pointsLedger.amount, 0) // Only positive earnings
                )
            );

        // 3. Unanswered WA Interactions (> 5 mins ago, not admin notified? Or just open ones)
        // Schema: wa_interactions has clickedAt.
        // Logic: Count interactions where (now - clickedAt) > 5 mins AND isAdminNotified is false (or true depending on workflow). 
        // Requirement: "belum ada balasan". We don't have 'isReplied' status.
        // Let's assume 'isAdminNotified' = false means it's fresh and might need attention.
        // Or strictly: "clicked > 5 mins ago".
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const [unansweredCount] = await db.select({ count: count() })
            .from(waInteractions)
            .where(
                and(
                    eq(waInteractions.agentId, user.id),
                    gte(waInteractions.clickedAt, fiveMinutesAgo) // Actually we want OLDER than 5 mins? 
                    // No, usually watchdog is for "Waiting > 5 mins". So clickedAt < fiveMinutesAgo.
                    // But if it's TOO old (e.g. yesterday), we might ignore?
                    // Let's just say "Recent but > 5 mins" (e.g., last 24h, > 5 mins).
                    // Refined Query: 
                    // clickedAt < 5 mins ago AND clickedAt > 24 hours ago
                )
            );
        // Wait, simple logic first: Just stats.
        // Let's return the Raw Count of interactions today.

        // REVISIT: The watchdog needs to alert if "waiting > 5 mins".
        // Let's Count Total Interactions Today serves as "Activity".
        // The frontend Watchdog will poll for specific "pending" items.

        // Let's stick to simple stats for the Card Overview.
        // Returns "Unanswered" could change to "Total Interactions".
        const [interactionCount] = await db.select({ count: count() })
            .from(waInteractions)
            .where(eq(waInteractions.agentId, user.id));


        return c.json({
            success: true,
            data: {
                totalReferrals: referralCount?.count || 0,
                totalCommission: totalPoints?.total || 0,
                totalInteractions: interactionCount?.count || 0 // Placeholder for specific "unanswered" logic
            }
        });

    } catch (error) {
        console.error("Agent Stats Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/agent/referrals
 * @desc    Get List of Referred Nasabah
 * @access  Agent
 */
agentRoute.get('/referrals', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    try {
        // Join Users + Profiles + PolisData (to check status)
        // We want to list users where profiles.referredByAgentId == user.userId

        // 1. Get List of Profiles referring this Agent
        // Note: Drizzle join syntax
        const referredUsers = await db.select({
            id: users.id,
            fullName: profiles.fullName,
            userId: users.userId,
            pointsBalance: users.pointsBalance,
            whatsapp: profiles.whatsapp,
            joinedAt: users.createdAt,
            // Polis info?
            polisCount: count(polisData.id)
        })
            .from(profiles)
            .innerJoin(users, eq(profiles.userId, users.id))
            .leftJoin(polisData, eq(polisData.nasabahId, users.id))
            .where(eq(profiles.referredByAgentId, user.userId))
            .groupBy(users.id, profiles.fullName, users.userId, users.pointsBalance, profiles.whatsapp, users.createdAt)
            .orderBy(desc(users.createdAt));

        return c.json({ success: true, data: referredUsers });

    } catch (error) {
        console.error("Agent Referrals Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/agent/chart/growth
 * @desc    Get Growth Chart Data (New Referrals over time)
 * @access  Agent
 */
agentRoute.get('/chart/growth', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    try {
        // Monthly Growth of Referrals
        // We aggregate profiles.userId by Month, filtered by referredByAgentId

        // Raw SQL for aggregation is often easier for timestamps
        const growthDataRaw = await db.execute(sql`
            SELECT
                TO_CHAR(u.created_at, 'Mon') as name,
                COUNT(u.id)::int as value
            FROM ${profiles} p
            JOIN ${users} u ON p.user_id = u.id
            WHERE p.referred_by_agent_id = ${user.userId}
            GROUP BY TO_CHAR(u.created_at, 'Mon'), DATE_TRUNC('month', u.created_at)
            ORDER BY DATE_TRUNC('month', u.created_at) ASC
            LIMIT 6
        `);

        const chartData = (growthDataRaw as any).rows || [];
        return c.json({ success: true, data: chartData });

    } catch (error) {
        console.error("Agent Chart Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

// Watchdog Endpoint
/**
 * @route   GET /api/v1/agent/watchdog
 * @desc    Check for urgent unanswered WA interactions
 * @access  Agent
 */
agentRoute.get('/watchdog', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    // Logic: interactions > 5 mins ago, < 24 hours ago, not 'resolved'
    // Since we lack 'resolved' column, we'll check 'isAdminNotified' as a proxy 
    // OR we just return recent clicks and let Frontend decide if it's "unanswered".
    // Better: Return the count of interactions created 5+ mins ago that don't have a follow-up action?
    // Let's implement the specific logic requested: 
    // "jika ada data ... > 5 menit"

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600000);

    try {
        // Find interactions where clickedAt is between 24h ago and 5m ago
        // And assume they are "unanswered" (placeholder logic)
        const pendingInteractions = await db.select({
            id: waInteractions.id,
            nasabahId: waInteractions.nasabahId,
            clickedAt: waInteractions.clickedAt
        })
            .from(waInteractions)
            .where(
                and(
                    eq(waInteractions.agentId, user.id),
                    gte(waInteractions.clickedAt, twentyFourHoursAgo),
                    // lte(waInteractions.clickedAt, fiveMinutesAgo) // Valid if we want EXACTLY > 5 mins
                    sql`${waInteractions.clickedAt} <= ${fiveMinutesAgo}`
                )
            )
            .limit(5);

        return c.json({
            success: true,
            data: pendingInteractions,
            hasUrgent: pendingInteractions.length > 0
        });

    } catch (error) {
        console.error("Agent Watchdog Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/agent/referrals/:id
 * @desc    Get Detailed Profile of a specific Referral
 * @access  Agent (Strict Ownership Check)
 */
agentRoute.get('/referrals/:id', rbacMiddleware(), async (c) => {
    const user = c.get('user');
    const nasabahId = c.req.param('id');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    try {
        // 1. Security Check: Is this Nasabah referred by THIS agent?
        const [referralCheck] = await db.select({
            id: users.id,
            fullName: profiles.fullName,
            userId: users.userId,
            pointsBalance: users.pointsBalance,
            whatsapp: profiles.whatsapp,
            email: profiles.email,
            joinedAt: users.createdAt,
        })
            .from(profiles)
            .innerJoin(users, eq(profiles.userId, users.id))
            .where(
                and(
                    eq(users.id, nasabahId),
                    eq(profiles.referredByAgentId, user.userId) // CRITICAL SECURITY CHECK
                )
            )
            .limit(1);

        if (!referralCheck) {
            return c.json({ success: false, message: "Nasabah not found or not in your network." }, 404);
        }

        // 2. Fetch Active Polis
        const nasabahPolis = await db.select()
            .from(polisData)
            .where(eq(polisData.nasabahId, nasabahId))
            .orderBy(desc(polisData.createdAt));

        // 3. Fetch Recent Points History (Limit 20)
        const pointHistory = await db.select()
            .from(pointsLedger)
            .where(eq(pointsLedger.userId, nasabahId))
            .orderBy(desc(pointsLedger.createdAt))
            .limit(20);

        // 4. Fetch WA Interactions (Limit 20)
        const interactions = await db.select()
            .from(waInteractions)
            .where(eq(waInteractions.nasabahId, nasabahId))
            .orderBy(desc(waInteractions.clickedAt))
            .limit(20);

        return c.json({
            success: true,
            data: {
                profile: referralCheck,
                polis: nasabahPolis,
                points: pointHistory,
                interactions: interactions
            }
        });

    } catch (error) {
        console.error("Agent Referral Detail Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/agent/reminders
 * @desc    Get Polis expiration reminders (1, 2, 3 months away from 1 year)
 * @access  Agent
 */
agentRoute.get('/reminders', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    try {
        const agentPolis = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            createdAt: polisData.createdAt,
            nasabahName: profiles.fullName,
        })
            .from(polisData)
            .leftJoin(users, eq(polisData.nasabahId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(polisData.agentId, user.id));

        const now = new Date();
        const reminders = agentPolis.map(p => {
            if (!p.createdAt) return null;

            // Calculate months difference for annual reminder
            let months = (now.getFullYear() - p.createdAt.getFullYear()) * 12;
            months -= p.createdAt.getMonth();
            months += now.getMonth();
            const monthsLeft = 12 - months;

            // Calculate days until 1 year anniversary
            const anniversaryDate = new Date(p.createdAt);
            anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);
            const daysUntilAnniversary = Math.ceil((anniversaryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // H-7 reminder: 7 days before polis anniversary (1 year)
            if (daysUntilAnniversary <= 7 && daysUntilAnniversary > 0) {
                return {
                    ...p,
                    daysLeft: daysUntilAnniversary,
                    type: 'h7',
                    message: `Polis #${p.polisNumber} atas nama ${p.nasabahName} jatuh tempo dalam ${daysUntilAnniversary} hari.`
                };
            }
            // Monthly reminders: 1, 2, 3 months (showing as days remaining until 1 year)
            if (monthsLeft === 1 || monthsLeft === 2 || monthsLeft === 3) {
                const daysRemaining = Math.ceil(daysUntilAnniversary);
                return {
                    ...p,
                    daysLeft: daysRemaining,
                    type: 'monthly',
                    message: `Polis #${p.polisNumber} atas nama ${p.nasabahName} jatuh tempo dalam ${daysRemaining} hari.`
                };
            }
            return null;
        }).filter(Boolean);

        return c.json({ success: true, data: reminders });
    } catch (error) {
        console.error("Agent Reminders Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   GET /api/v1/agent/birthdays
 * @desc    Get upcoming Nasabah birthdays (Today & Tomorrow)
 * @access  Agent
 */
agentRoute.get('/birthdays', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    if (user.role !== 'agent') {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    try {
        // Find profiles referred by this agent where Month and Day match today or tomorrow
        const timeZoneOffset = '+07:00'; // Assume WIB / standardized localized offset for the app

        const birthdayQuery = sql`
            SELECT 
                p.id,
                p.user_id as "userId",
                p.full_name as "fullName",
                p.whatsapp,
                p.date_of_birth as "dateOfBirth",
                EXTRACT(YEAR FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) - EXTRACT(YEAR FROM p.date_of_birth) AS age,
                CASE 
                    WHEN EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                         AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                    THEN 'today'
                    ELSE 'tomorrow'
                END as "birthdayWhen"
            FROM profiles p
            WHERE p.referred_by_agent_id = ${user.userId}
              AND p.date_of_birth IS NOT NULL
              AND (
                  (EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}) 
                   AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE AT TIME ZONE ${timeZoneOffset}))
                  OR 
                  (EXTRACT(MONTH FROM p.date_of_birth) = EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE ${timeZoneOffset}) 
                   AND EXTRACT(DAY FROM p.date_of_birth) = EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE ${timeZoneOffset}))
              )
            ORDER BY "birthdayWhen" DESC, "fullName" ASC
        `;

        const result = await db.execute(birthdayQuery);
        const data = (result as any).rows || result;

        return c.json({ success: true, data });
    } catch (error) {
        console.error("Agent Birthdays Error:", error);
        return c.json({ success: false, message: "Failed to fetch birthdays" }, 500);
    }
});

export default agentRoute;
