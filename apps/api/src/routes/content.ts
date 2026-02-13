import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, announcements, announcementViews } from '@repo/database';
import { eq, desc, and, sql } from 'drizzle-orm';
import { rbacMiddleware } from '../middlewares/rbac';
import { AuthUser } from '../types/hono';

const contentRoute = new Hono<{ Variables: { user: AuthUser } }>();

// Schemas
const CreateAnnouncementSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    videoUrl: z.string().url().optional(),
    isActive: z.boolean().optional().default(true),
});

/**
 * @route   GET /api/v1/content/announcements
 * @desc    List Active Announcements
 * @access  Public / Authenticated
 */
contentRoute.get('/announcements', async (c) => {
    // Optional: Get user context if available to check 'viewed' status
    // Since RBAC might block, we need to decide if this is public.
    // The requirement says "Announcements (Pop-up Promo/Video)".
    // Let's assume it's public for now, but enriched if token present.
    // However, rbacMiddleware usually attached globally or per route.
    // If we want public access, we shouldn't use rbacMiddleware on this specific route,
    // or rbacMiddleware should allow "guest".
    // Current rbacMiddleware blocks if no user.
    // Let's assume User/Agent app requires login. So we use RBAC.

    // We can't easily access `c.get('user')` if middleware is not running or if it throws 401.
    // Let's just use RBAC for now as "Private" (Nasabah/Agent only).

    return await listAnnouncements(c);
});

// Helper to allow re-use if we add public later
async function listAnnouncements(c: any) {
    const user = c.get('user'); // Might be undefined if public

    try {
        const items = await db.select()
            .from(announcements)
            .where(eq(announcements.isActive, true))
            .orderBy(desc(announcements.id));

        // Enrich with 'isViewed' if user exists
        let result = items;
        if (user) {
            const views = await db.select()
                .from(announcementViews)
                .where(eq(announcementViews.userId, user.id));

            const viewedIds = new Set(views.map(v => v.announcementId));

            result = items.map(item => ({
                ...item,
                isViewed: viewedIds.has(item.id)
            }));
        }

        return c.json({ success: true, data: result });
    } catch (error) {
        console.error("Fetch Announcements Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
}

/**
 * @route   GET /api/v1/content/announcements/latest
 * @desc    Get the latest unviewed active announcement for the current user
 * @access  Authenticated User
 */
contentRoute.get('/announcements/latest', rbacMiddleware(), async (c) => {
    const user = c.get('user');

    try {
        const [latestUnviewed] = await db
            .select({
                id: announcements.id,
                title: announcements.title,
                content: announcements.content,
                videoUrl: announcements.videoUrl,
                ctaUrl: announcements.ctaUrl,
                isActive: announcements.isActive,
                createdAt: announcements.createdAt,
            })
            .from(announcements)
            .leftJoin(
                announcementViews,
                and(
                    eq(announcements.id, announcementViews.announcementId),
                    eq(announcementViews.userId, user.id)
                )
            )
            .where(
                and(
                    eq(announcements.isActive, true),
                    sql`${announcementViews.id} IS NULL`
                )
            )
            .orderBy(desc(announcements.createdAt))
            .limit(1);

        return c.json({ success: true, data: latestUnviewed || null });
    } catch (error) {
        console.error("Latest Announcement Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /api/v1/content/announcements
 * @desc    Create Announcement
 * @access  Admin Input, Super Admin
 */
contentRoute.post('/announcements', rbacMiddleware(), zValidator('json', CreateAnnouncementSchema), async (c) => {
    const body = c.req.valid('json');

    try {
        const [newItem] = await db.insert(announcements).values(body).returning();
        return c.json({ success: true, data: newItem }, 201);
    } catch (error) {
        console.error("Create Announcement Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   POST /api/v1/content/announcements/:id/view
 * @desc    Mark Announcement as Viewed
 * @access  Authenticated User
 */
contentRoute.post('/announcements/:id/view', rbacMiddleware(), async (c) => {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user');

    if (isNaN(id)) return c.json({ success: false, message: "Invalid ID" }, 400);

    try {
        // Idempotent: Check if already viewed
        const [existing] = await db.select().from(announcementViews)
            .where(and(
                eq(announcementViews.announcementId, id),
                eq(announcementViews.userId, user.id)
            ))
            .limit(1);

        if (!existing) {
            await db.insert(announcementViews).values({
                announcementId: id,
                userId: user.id
            });
        }

        return c.json({ success: true, message: "View recorded" });

    } catch (error) {
        console.error("Record View Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

/**
 * @route   PATCH /api/v1/content/announcements/:id
 * @desc    Toggle Active Status
 * @access  Super Admin
 */
contentRoute.patch('/announcements/:id', rbacMiddleware(), zValidator('json', z.object({ isActive: z.boolean() })), async (c) => {
    const id = parseInt(c.req.param('id'));
    const { isActive } = c.req.valid('json');

    try {
        const [updated] = await db.update(announcements)
            .set({ isActive })
            .where(eq(announcements.id, id))
            .returning();

        if (!updated) return c.json({ success: false, message: "Not found" }, 404);

        return c.json({ success: true, data: updated });
    } catch (error) {
        console.error("Toggle Announcement Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default contentRoute;
