import { Hono } from 'hono';
import { db, waInteractions, users, profiles } from '@repo/database';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AuthUser } from '../types/hono';

const interactions = new Hono<{ Variables: { user: AuthUser } }>();

const LogWaSchema = z.object({
    productId: z.number().int(),
    productName: z.string()
});

/**
 * @route   POST /api/v1/interactions/wa
 * @desc    Log WA click and get Agent contact
 * @access  Private (Nasabah)
 */
interactions.post('/wa', zValidator('json', LogWaSchema), async (c) => {
    const user = c.get('user');
    const { productId, productName } = c.req.valid('json');

    if (user.role !== 'nasabah') {
        return c.json({ success: false, message: "Only Nasabah can initiate purchases" }, 403);
    }

    try {
        // 1. Get Nasabah Profile and their Agent
        const [nasabahProfile] = await db.select({
            fullName: profiles.fullName,
            referredByAgentId: profiles.referredByAgentId
        })
            .from(profiles)
            .where(eq(profiles.userId, user.id))
            .limit(1);

        if (!nasabahProfile || !nasabahProfile.referredByAgentId) {
            return c.json({
                success: false,
                message: "Anda belum terhubung dengan agen. Silakan hubungi admin."
            }, 400);
        }

        // 2. Get Agent Details
        const [agent] = await db.select({
            whatsapp: profiles.whatsapp,
            fullName: profiles.fullName
        })
            .from(users)
            .innerJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.userId, nasabahProfile.referredByAgentId))
            .limit(1);

        if (!agent) {
            return c.json({ success: false, message: "Agen tidak ditemukan" }, 404);
        }

        // 3. Log Interaction
        await db.insert(waInteractions).values({
            nasabahId: user.id,
            agentId: null, // We could store agent UUID here if needed, schema says references users.id
            clickedAt: new Date(),
            isAdminNotified: false
        });

        // 4. Construct WhatsApp URL components
        const message = `Halo ${agent.fullName}, saya ${nasabahProfile.fullName} tertarik untuk membeli produk ${productName}. Mohon informasinya.`;
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${agent.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;

        return c.json({
            success: true,
            data: {
                waUrl,
                agentName: agent.fullName,
                agentWhatsapp: agent.whatsapp
            }
        });

    } catch (error) {
        console.error("WA Interaction Error:", error);
        return c.json({ success: false, message: "Internal Server Error" }, 500);
    }
});

export default interactions;
