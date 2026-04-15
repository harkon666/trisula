import { Hono } from 'hono';
import { db, users, profiles, waInteractions, adminActions, polisData } from '@repo/database';
import { eq, and, desc } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';

// ... (other codes)



type Env = {
    Variables: {
        user: {
            id: string;
            role: string;
            userId: string;
        };
    };
};

const internal = new Hono<Env>();

/**
 * @route   GET /admin/internal/nasabah-agents
 * @desc    Get list of nasabahs with their linked agents for auto-fill logic
 * @access  Super Admin, Admin Input, Admin View
 */
internal.get('/nasabah-agents', rbacMiddleware('polis'), async (c) => {
    try {
        // We need: Nasabah (ID, Name, UserId) + Linked Agent (ID, Name, UserId)
        const result = await db.select({
            id: users.id,
            userId: users.userId,
            fullName: profiles.fullName,
            agentUserId: profiles.referredByAgentId, // This is the string ID of the agent
        })
            .from(users)
            .innerJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.role, 'nasabah'))
            .orderBy(desc(users.createdAt));

        // Now we need to fetch the agents to map the agentUserId strings to actual UUIDs and Names
        // To be efficient, we can either join or do a second query if the list is small.
        // Joining is cleaner.

        // Refined Query with Join to get Agent Details
        // We'll use aliases for clarity if drizzle supports them well in this context, 
        // or just join profiles twice.

        // Let's do a more robust join:
        const nasabahWithAgents = await db.transaction(async (tx) => {
            const list = await tx.select({
                nasabahId: users.id,
                nasabahUserId: users.userId,
                nasabahName: profiles.fullName,
                agentUserId: profiles.referredByAgentId,
            })
                .from(users)
                .innerJoin(profiles, eq(users.id, profiles.userId))
                .where(eq(users.role, 'nasabah'));

            // Fetch all agents and their profiles for mapping
            const allAgents = await tx.select({
                id: users.id,
                userId: users.userId,
                fullName: profiles.fullName,
            })
                .from(users)
                .innerJoin(profiles, eq(users.id, profiles.userId))
                .where(eq(users.role, 'agent'));

            const agentMap = new Map(allAgents.map(a => [a.userId, a]));

            return list.map(n => ({
                ...n,
                agent: n.agentUserId ? agentMap.get(n.agentUserId) || null : null
            }));
        });

        return c.json({ success: true, data: nasabahWithAgents });
    } catch (error) {
        console.error("Internal Nasabah-Agents Error:", error);
        return c.json({ success: false, message: "Failed to fetch internal data" }, 500);
    }
});

/**
 * @route   GET /admin/internal/agents
 * @desc    Get plain list of agents (needed as fallback or separate selection)
 * @access  Super Admin, Admin Input
 */
internal.get('/agents', rbacMiddleware('polis'), async (c) => {
    try {
        const agents = await db.select({
            id: users.id,
            userId: users.userId,
            fullName: profiles.fullName,
        })
            .from(users)
            .innerJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.role, 'agent'))
            .orderBy(desc(users.createdAt));

        return c.json({ success: true, data: agents });
    } catch (error) {
        console.error("Internal Agents Error:", error);
        return c.json({ success: false, message: "Failed to fetch agents" }, 500);
    }
});

/**
 * @route   GET /admin/internal/announcements
 * @desc    List all announcements with view counts
 * @access  Super Admin, Admin Input, Admin View
 */
internal.get('/announcements', rbacMiddleware('announcements'), async (c) => {
    const { announcements, announcementViews } = await import('@repo/database');
    const { count } = await import('drizzle-orm');

    try {
        const result = await db
            .select({
                id: announcements.id,
                title: announcements.title,
                videoUrl: announcements.videoUrl,
                content: announcements.content,
                ctaUrl: announcements.ctaUrl,
                isActive: announcements.isActive,
                createdAt: announcements.createdAt,
                totalViews: count(announcementViews.id),
            })
            .from(announcements)
            .leftJoin(announcementViews, eq(announcements.id, announcementViews.announcementId))
            .groupBy(
                announcements.id,
                announcements.title,
                announcements.videoUrl,
                announcements.content,
                announcements.ctaUrl,
                announcements.isActive,
                announcements.createdAt
            )
            .orderBy(desc(announcements.createdAt));

        return c.json({ success: true, data: result });
    } catch (error) {
        console.error("Internal List Announcements Error:", error);
        return c.json({ success: false, message: "Failed to fetch announcements" }, 500);
    }
});

/**
 * @route   GET /admin/internal/watchdog/alerts
 * @desc    Get unhandled WA interactions for Watchdog Monitor
 * @access  Super Admin, Admin Input, Admin View
 */
internal.get('/watchdog/alerts', rbacMiddleware('watchdog'), async (c) => {
    const { waInteractions, users, profiles } = await import('@repo/database');
    const { eq, and, asc } = await import('drizzle-orm');
    const { alias } = await import('drizzle-orm/pg-core');

    try {
        // Alias profiles for Agent to distinguish from Nasabah
        const agentProfiles = alias(profiles, "agent_profiles");
        const nasabahProfiles = alias(profiles, "nasabah_profiles");

        const alerts = await db.select({
            id: waInteractions.id,
            clickedAt: waInteractions.clickedAt,
            nasabah: {
                id: waInteractions.nasabahId,
                name: nasabahProfiles.fullName,
                whatsapp: nasabahProfiles.whatsapp,
            },
            agent: {
                id: waInteractions.agentId,
                name: agentProfiles.fullName,
            }
        })
            .from(waInteractions)
            // Join for Nasabah Profile
            .leftJoin(nasabahProfiles, eq(waInteractions.nasabahId, nasabahProfiles.userId))
            // Join for Agent Profile
            .leftJoin(agentProfiles, eq(waInteractions.agentId, agentProfiles.userId))
            .where(eq(waInteractions.isAdminNotified, false))
            .orderBy(asc(waInteractions.clickedAt));

        return c.json({ success: true, data: alerts });
    } catch (error) {
        console.error("Watchdog Alerts Error:", error);
        return c.json({ success: false, message: "Failed to fetch watchdog alerts" }, 500);
    }
});

/**
 * @route   PATCH /admin/internal/watchdog/resolve/:id
 * @desc    Mark interaction as resolved by admin
 * @access  Super Admin, Admin Input
 */
internal.patch('/watchdog/resolve/:id', rbacMiddleware('watchdog'), async (c) => {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user');

    // Static imports used (waInteractions, adminActions)

    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);

    console.log(`[WATCHDOG RESOLVE] Attempting to resolve ID: ${id}`);
    console.log(`[WATCHDOG RESOLVE] Admin: ${JSON.stringify(user)}`);

    try {
        await db.transaction(async (tx) => {
            // 1. Update Interaction Status
            await tx.update(waInteractions)
                .set({ isAdminNotified: true })
                .where(eq(waInteractions.id, id));

            // 2. Log Admin Action
            const ipAddress = c.req.header('x-forwarded-for') || 'unknown';
            const userAgent = c.req.header('user-agent') || 'unknown';

            console.log(`[WATCHDOG LOG] Inserting admin action... IP: ${ipAddress}`);

            await tx.insert(adminActions).values({
                adminId: user.id,
                action: 'WATCHDOG_RESOLVE',
                details: { interactionId: id },
                ipAddress: ipAddress,
                userAgent: userAgent,
                createdAt: new Date(),
            });
        });

        console.log(`[WATCHDOG RESOLVE] Success for ID: ${id}`);
        return c.json({ success: true, message: "Alert resolved" });
    } catch (error) {
        console.error("Watchdog Resolve Error Full Stack:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        return c.json({ success: false, message: "Failed to resolve alert", error: String(error) }, 500);
    }
});

/**
 * @route   GET /admin/internal/polis/reminders
 * @desc    Get polis jatuh tempo reminders for admin notification
 * @access  Super Admin, Admin
 */
internal.get('/polis/reminders', rbacMiddleware('polis'), async (c) => {
    try {
        const now = new Date();
        const allPolis = await db.select({
            id: polisData.id,
            polisNumber: polisData.polisNumber,
            createdAt: polisData.createdAt,
            premiumAmount: polisData.premiumAmount,
            productName: polisData.productName,
            status: polisData.status,
            agentId: polisData.agentId,
            nasabahId: polisData.nasabahId,
        })
            .from(polisData)
            .where(eq(polisData.status, 'approved'));

        const reminders = [];

        for (const p of allPolis) {
            if (!p.createdAt) continue;

            // Calculate days until 1 year anniversary
            const anniversaryDate = new Date(p.createdAt);
            anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);
            const daysUntilAnniversary = Math.ceil((anniversaryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate months left
            let months = (now.getFullYear() - p.createdAt.getFullYear()) * 12;
            months -= p.createdAt.getMonth();
            months += now.getMonth();
            const monthsLeft = 12 - months;

            // Get nasambah name
            const [nasabahProfile] = await db.select({ fullName: profiles.fullName })
                .from(profiles)
                .where(eq(profiles.userId, p.nasabahId))
                .limit(1);

            const nasabahName = nasabahProfile?.fullName || 'Unknown';

            // Get agent name
            const [agentProfile] = await db.select({ fullName: profiles.fullName })
                .from(profiles)
                .where(eq(profiles.userId, p.agentId))
                .limit(1);

            const agentName = agentProfile?.fullName || 'Unknown';

            // H-7 reminder: 7 days before polis anniversary (1 year)
            if (daysUntilAnniversary <= 7 && daysUntilAnniversary > 0) {
                reminders.push({
                    id: p.id,
                    polisNumber: p.polisNumber,
                    nasabahName,
                    agentName,
                    daysLeft: daysUntilAnniversary,
                    type: 'h7',
                    message: `Polis #${p.polisNumber} atas nama ${nasabahName} jatuh tempo dalam ${daysUntilAnniversary} hari.`,
                    premiumAmount: p.premiumAmount,
                    productName: p.productName,
                });
            }
            // Monthly reminders: 1, 2, 3 months (showing as days remaining until 1 year)
            if (monthsLeft === 1 || monthsLeft === 2 || monthsLeft === 3) {
                reminders.push({
                    id: p.id,
                    polisNumber: p.polisNumber,
                    nasabahName,
                    agentName,
                    daysLeft: Math.ceil(daysUntilAnniversary),
                    type: 'monthly',
                    message: `Polis #${p.polisNumber} atas nama ${nasabahName} jatuh tempo dalam ${Math.ceil(daysUntilAnniversary)} hari.`,
                    premiumAmount: p.premiumAmount,
                    productName: p.productName,
                });
            }
        }

        // Sort by daysLeft (closest first)
        reminders.sort((a, b) => a.daysLeft - b.daysLeft);

        return c.json({ success: true, data: reminders });
    } catch (error) {
        console.error("Polis Reminders Error:", error);
        return c.json({ success: false, message: "Failed to fetch polis reminders" }, 500);
    }
});

export default internal;
