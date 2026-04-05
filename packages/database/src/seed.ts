import { db, users, profiles, rewards, waInteractions, polisData } from "./index";
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
                balance: 1000,
                dob: "1990-01-01"
            },
            {
                name: "Admin User",
                userId: "ADMIN01",
                email: "admin1@trisula.com",
                phone: "628000000001",
                role: "admin",
                balance: 0,
                additionalMetadata: {
                    permissions: {
                        codes: ["read", "write"],
                        polis: ["read", "write"],
                        users: ["read", "write"],
                        rewards: ["read", "write"],
                        products: ["read", "write"],
                        security: ["read", "write"],
                        watchdog: ["read", "write"],
                        fulfillment: ["read", "write"],
                        announcements: ["read", "write"],
                        performance: ["read", "write"]
                    }
                },
                dob: "1985-06-15"
            },
            {
                name: "Super Admin",
                userId: "SUPER01",
                email: "super1@trisula.com",
                phone: "628000000000",
                role: "super_admin",
                balance: 999999,
                dob: "1980-12-30"
            },
            {
                name: "Nasabah Sultan",
                userId: null, // Nasabah no longer requires userId
                email: "nasabah1@trisula.com",
                phone: "628999999999",
                role: "nasabah",
                balance: 150, // Including welcome bonus
                dob: `${new Date().getFullYear() - 30}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` // Turns 30 today
            }
        ];

        for (const u of usersToSeed) {
            // Check existence: Agents/Admin by userId, Nasabah by email
            const existing = await db.query.profiles.findFirst({
                where: (profiles, { eq }) => eq(profiles.email, u.email),
            });

            if (existing) {
                console.log(`⚠️ User ${u.email} already exists. Skipping.`);
                continue;
            }

            // Insert User (Core Auth)
            const [newUser] = await db.insert(users).values({
                userId: u.userId as any,
                password: passwordHash,
                role: u.role as any,
                pointsBalance: u.balance,
                isActive: true,
                additionalMetadata: (u as any).additionalMetadata || {}
            }).returning();

            if (!newUser) {
                console.error(`❌ Failed to create user: ${u.email}`);
                continue;
            }

            // Insert Profile (Details)
            await db.insert(profiles).values({
                userId: newUser.id,
                fullName: u.name,
                email: u.email,
                whatsapp: u.phone,
                dateOfBirth: (u as any).dob,
            });

            console.log(`✅ User created: ${newUser.userId} (${u.role})`);
        }

        console.log("✅ Users & Profiles initialized.");

        // Seeding Rewards (Catalog)
        console.log("🎁 Seeding Rewards Catalog...");
        const catalogItems = [
            { title: "Voucher Kopi Premium", requiredPoints: 50, description: "Nikmati kopi spesial racikan barista terbaik.", csWhatsappNumber: "628123456789" },
            { title: "E-Money Rp 100.000", requiredPoints: 1000, description: "Saldo E-Money untuk kebutuhan transaksi harian Anda.", csWhatsappNumber: "628123456789" },
            { title: "Trisula Exclusive Merch", requiredPoints: 500, description: "Kaos eksklusif komunitas Trisula.", csWhatsappNumber: "628123456789" },
            { title: "Mystery Box", requiredPoints: 200, description: "Kotak kejutan berisi hadiah menarik.", csWhatsappNumber: "628000000000" },
            { title: "Samsung Galaxy S24", requiredPoints: 50000, description: "Smartphone flagship untuk member sultan.", csWhatsappNumber: "628999999999" },
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
        const nasabahProfile = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.email, "nasabah1@trisula.com"),
        });

        if (agent && nasabahProfile) {
            const now = new Date();
            const interactions = [
                {
                    nasabahId: nasabahProfile.userId,
                    agentId: agent.id,
                    clickedAt: new Date(now.getTime() - 1000 * 60 * 1), // 1 min ago (Safe)
                    isAdminNotified: false
                },
                {
                    nasabahId: nasabahProfile.userId,
                    agentId: agent.id,
                    clickedAt: new Date(now.getTime() - 1000 * 60 * 4), // 4 mins ago (Warning)
                    isAdminNotified: false
                },
                {
                    nasabahId: nasabahProfile.userId,
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

        // Seeding Polis Data for Reminders
        console.log("📜 Seeding Polis Data for Reminders...");
        const admin = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.userId, "ADMIN01"),
        });

        if (agent && nasabahProfile && admin) {
            const now = new Date();
            const samplePolis = [
                {
                    polisNumber: "POL-REM-3BLN",
                    agentId: agent.id,
                    nasabahId: nasabahProfile.userId,
                    premiumAmount: 5000000,
                    inputBy: admin.id,
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 9, now.getDate()) // 3 months until 1yr
                },
                {
                    polisNumber: "POL-REM-2BLN",
                    agentId: agent.id,
                    nasabahId: nasabahProfile.userId,
                    premiumAmount: 7500000,
                    inputBy: admin.id,
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 10, now.getDate()) // 2 months until 1yr
                },
                {
                    polisNumber: "POL-REM-1BLN",
                    agentId: agent.id,
                    nasabahId: nasabahProfile.userId,
                    premiumAmount: 10000000,
                    inputBy: admin.id,
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 11, now.getDate()) // 1 month until 1yr
                }
            ];

            for (const p of samplePolis) {
                const existing = await db.query.polisData.findFirst({
                    where: (polisData, { eq }) => eq(polisData.polisNumber, p.polisNumber),
                });
                if (!existing) {
                    await db.insert(polisData).values(p);
                }
            }
            console.log("✅ Polis reminders seeded.");
        }

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        // In bun/script context, we might need to manually close client or just exit
        process.exit(0);
    }
}

seed();
