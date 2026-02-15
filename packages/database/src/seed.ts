import { db, users, profiles, rewards, waInteractions } from "./index";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        // Shared Password Hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("123456", salt);
        const usersToSeed = [
            {
                name: "Agent Primary",
                userId: "SULTAN01", // Used as Handle/Referral Code
                email: "agent1@trisula.com",
                phone: "628123456789",
                role: "agent",
                balance: 1000
            },
            {
                name: "Admin User",
                userId: "ADMIN01",
                email: "admin1@trisula.com",
                phone: "628000000001",
                role: "admin_input",
                balance: 0
            },
            {
                name: "Admin View",
                userId: "ADMIN02",
                email: "admin2@trisula.com",
                phone: "628000000002",
                role: "admin_view",
                balance: 0
            },
            {
                name: "Super Admin",
                userId: "SUPER01",
                email: "super1@trisula.com",
                phone: "628000000000",
                role: "super_admin",
                balance: 999999
            },
            {
                name: "Nasabah Sultan",
                userId: "NASABAH01",
                email: "nasabah1@trisula.com",
                phone: "628999999999",
                role: "nasabah",
                balance: 50
            }
        ];

        for (const u of usersToSeed) {
            // Check existence by email (via profiles join? or just skip if userId exists)
            const existing = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.userId, u.userId),
            });

            if (existing) {
                console.log(`⚠️ User ${u.userId} already exists. Skipping.`);
                continue;
            }

            // Insert User (Core Auth)
            const [newUser] = await db.insert(users).values({
                userId: u.userId,
                password: passwordHash,
                role: u.role as any,
                pointsBalance: u.balance,
                isActive: true,
                additionalMetadata: { referral_code: u.userId }, // Storing same as userId for now
            }).returning();

            // Insert Profile (Details)
            await db.insert(profiles).values({
                userId: newUser.id,
                fullName: u.name,
                email: u.email,
                whatsapp: u.phone,
            });

            console.log(`✅ User created: ${newUser.userId} (${u.role})`);
        }

        console.log("✅ Users & Profiles initialized.");

        // Seeding Rewards (Catalog)
        console.log("🎁 Seeding Rewards Catalog...");
        const catalogItems = [
            { title: "Voucher Kopi Premium", requiredPoints: 50, description: "Nikmati kopi spesial racikan barista terbaik." },
            { title: "E-Money Rp 100.000", requiredPoints: 1000, description: "Saldo E-Money untuk kebutuhan transaksi harian Anda." },
            { title: "Trisula Exclusive Merch", requiredPoints: 500, description: "Kaos eksklusif komunitas Trisula." },
            { title: "Mystery Box", requiredPoints: 200, description: "Kotak kejutan berisi hadiah menarik." },
            { title: "Samsung Galaxy S24", requiredPoints: 50000, description: "Smartphone flagship untuk member sultan." },
        ];

        for (const item of catalogItems) {
            const existing = await db.query.rewards.findFirst({
                where: (rewards, { eq }) => eq(rewards.title, item.title),
            });

            if (!existing) {
                await db.insert(rewards).values(item);
            }
        }
        console.log("✅ Rewards seeded.");

        // Seeding Watchdog Interactions
        console.log("🛡️ Seeding Watchdog Interactions...");
        const agent = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.userId, "SULTAN01"),
        });
        const nasabah = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.userId, "NASABAH01"),
        });

        if (agent && nasabah) {
            const now = new Date();
            const interactions = [
                {
                    nasabahId: nasabah.id,
                    agentId: agent.id,
                    clickedAt: new Date(now.getTime() - 1000 * 60 * 1), // 1 min ago (Safe)
                    isAdminNotified: false
                },
                {
                    nasabahId: nasabah.id,
                    agentId: agent.id,
                    clickedAt: new Date(now.getTime() - 1000 * 60 * 4), // 4 mins ago (Warning)
                    isAdminNotified: false
                },
                {
                    nasabahId: nasabah.id,
                    agentId: agent.id,
                    clickedAt: new Date(now.getTime() - 1000 * 60 * 10), // 10 mins ago (URGENT)
                    isAdminNotified: false
                }
            ];

            // Clean up old seeds to avoid clutter if needed, or just append
            // await db.delete(waInteractions); // Optional, maybe too aggressive

            for (const interaction of interactions) {
                await db.insert(waInteractions).values(interaction);
            }
        }

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        // In bun/script context, we might need to manually close client or just exit
        process.exit(0);
    }
}

seed();
