import { db, users, profiles, rewards, waInteractions, polisData, pointsLedger, agentActivationCodes, products } from "./index";
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
                userId: "SULTAN01",
                email: "agent1@trisula.com",
                phone: "08123456789",
                role: "agent",
                balance: 1000,
                dob: "1990-01-01"
            },
            {
                name: "Agent Secondary",
                userId: "SULTAN02",
                email: "agent2@trisula.com",
                phone: "08123456780",
                role: "agent",
                balance: 500,
                dob: "1991-05-15"
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
                userId: null,
                email: "nasabah1@trisula.com",
                phone: "628999999999",
                role: "nasabah",
                balance: 150,
                dob: `${new Date().getFullYear() - 30}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
            },
            {
                name: "Nasabah Kedua",
                userId: null,
                email: "nasabah2@trisula.com",
                phone: "628999999998",
                role: "nasabah",
                balance: 200,
                dob: "1992-03-20"
            },
            {
                name: "Nasabah Ketiga",
                userId: null,
                email: "nasabah3@trisula.com",
                phone: "628999999997",
                role: "nasabah",
                balance: 50,
                dob: "1995-07-10"
            }
        ];

        for (const u of usersToSeed) {
            const existing = await db.query.profiles.findFirst({
                where: (profiles, { eq }) => eq(profiles.email, u.email),
            });

            if (existing) {
                console.log(`⚠️ User ${u.email} already exists. Skipping.`);
                continue;
            }

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

            await db.insert(profiles).values({
                userId: newUser.id,
                fullName: u.name,
                email: u.email,
                whatsapp: u.phone,
                dateOfBirth: (u as any).dob,
                referredByAgentId: u.role === "nasabah" && u.userId === null ? "SULTAN01" : undefined
            });

            console.log(`✅ User created: ${newUser.userId} (${u.role})`);
        }

        console.log("✅ Users & Profiles initialized.");

        // Seeding Agent Activation Codes
        console.log("🔑 Seeding Agent Activation Codes...");
        const agentCodes = ["AGENT001", "AGENT002", "AGENT003", "AGENT004", "AGENT005"];
        const superAdmin = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.userId, "SUPER01") });
        for (const code of agentCodes) {
            const existing = await db.query.agentActivationCodes.findFirst({
                where: (agentActivationCodes, { eq }) => eq(agentActivationCodes.code, code),
            });
            if (!existing) {
                await db.insert(agentActivationCodes).values({
                    code,
                    isUsed: false,
                    generatedBy: superAdmin?.id
                });
            }
        }
        console.log("✅ Agent codes seeded.");

        // Seeding Products
        console.log("📦 Seeding Products...");
        const productItems = [
            { name: "Asuransi Jiwa Premium", description: "Proteksi jiwa dengan manfaat ganda", pointsReward: 100, mediaUrl: null, isActive: true },
            { name: "Asuransi Kesehatan", description: "Kesehatan komprehensif untuk keluarga", pointsReward: 150, mediaUrl: null, isActive: true },
            { name: "Investasi Wizard", description: "Product investasi dengan return menarik", pointsReward: 200, mediaUrl: null, isActive: true },
        ];
        for (const p of productItems) {
            const existing = await db.query.products.findFirst({
                where: (products, { eq }) => eq(products.name, p.name),
            });
            if (!existing) {
                await db.insert(products).values(p);
            }
        }
        console.log("✅ Products seeded.");

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

        // Get references for dependent seeding
        const agent1 = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.userId, "SULTAN01") });
        const admin = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.userId, "ADMIN01") });
        const profile1 = await db.query.profiles.findFirst({ where: (profiles, { eq }) => eq(profiles.email, "nasabah1@trisula.com") });
        const profile2 = await db.query.profiles.findFirst({ where: (profiles, { eq }) => eq(profiles.email, "nasabah2@trisula.com") });
        const profile3 = await db.query.profiles.findFirst({ where: (profiles, { eq }) => eq(profiles.email, "nasabah3@trisula.com") });

        if (!agent1 || !admin || !profile1 || !profile2 || !profile3) {
            console.error("❌ Missing base users for seeding polis!");
        } else {
            // Seeding Polis Data with different statuses
            console.log("📜 Seeding Polis Data...");
            const now = new Date();

            const polisEntries = [
                // Approved polis (for omset calculation)
                {
                    polisNumber: "POL-2024-001",
                    agentId: agent1.id,
                    nasabahId: profile1.userId,
                    premiumAmount: 5000000,
                    productName: "Asuransi Jiwa Premium",
                    inputBy: admin.id,
                    status: "approved",
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 6, 15)
                },
                {
                    polisNumber: "POL-2024-002",
                    agentId: agent1.id,
                    nasabahId: profile1.userId,
                    premiumAmount: 7500000,
                    productName: "Asuransi Kesehatan",
                    inputBy: admin.id,
                    status: "approved",
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 10)
                },
                // Pending polis (waiting approval)
                {
                    polisNumber: "POL-2024-003",
                    agentId: agent1.id,
                    nasabahId: profile2.userId,
                    premiumAmount: 10000000,
                    productName: "Investasi Wizard",
                    inputBy: agent1.id,
                    status: "pending",
                    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)
                },
                // Another pending polis
                {
                    polisNumber: "POL-2024-004",
                    agentId: agent1.id,
                    nasabahId: profile3.userId,
                    premiumAmount: 3000000,
                    productName: "Asuransi Jiwa Premium",
                    inputBy: agent1.id,
                    status: "pending",
                    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24)
                },
                // Rejected polis
                {
                    polisNumber: "POL-2024-005",
                    agentId: agent1.id,
                    nasabahId: profile2.userId,
                    premiumAmount: 2000000,
                    productName: "Asuransi Kesehatan",
                    inputBy: agent1.id,
                    status: "rejected",
                    rejectionReason: "Nilai polis tidak sesuai dengan ketentuan",
                    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)
                },
                // Reminder polis - 3 months left
                {
                    polisNumber: "POL-REM-3BLN",
                    agentId: agent1.id,
                    nasabahId: profile1.userId,
                    premiumAmount: 5000000,
                    productName: "Asuransi Jiwa Premium",
                    inputBy: admin.id,
                    status: "approved",
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 9, now.getDate())
                },
                // Reminder polis - 2 months left
                {
                    polisNumber: "POL-REM-2BLN",
                    agentId: agent1.id,
                    nasabahId: profile2.userId,
                    premiumAmount: 7500000,
                    productName: "Asuransi Kesehatan",
                    inputBy: admin.id,
                    status: "approved",
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 10, now.getDate())
                },
                // Reminder polis - 1 month left
                {
                    polisNumber: "POL-REM-1BLN",
                    agentId: agent1.id,
                    nasabahId: profile3.userId,
                    premiumAmount: 10000000,
                    productName: "Investasi Wizard",
                    inputBy: admin.id,
                    status: "approved",
                    createdAt: new Date(now.getFullYear(), now.getMonth() - 11, now.getDate())
                },
                // H-7 reminder polis (created ~358 days ago for 1 year anniversary in 7 days)
                {
                    polisNumber: "POL-H7-001",
                    agentId: agent1.id,
                    nasabahId: profile1.userId,
                    premiumAmount: 8000000,
                    productName: "Asuransi Jiwa Premium",
                    inputBy: admin.id,
                    status: "approved",
                    createdAt: new Date(now.getTime() - (1000 * 60 * 60 * 24 * 358))
                },
            ];

            for (const p of polisEntries) {
                const existing = await db.query.polisData.findFirst({
                    where: (polisData, { eq }) => eq(polisData.polisNumber, p.polisNumber),
                });
                if (!existing) {
                    await db.insert(polisData).values({
                        polisNumber: p.polisNumber,
                        agentId: p.agentId,
                        nasabahId: p.nasabahId,
                        premiumAmount: p.premiumAmount,
                        productName: p.productName,
                        inputBy: p.inputBy,
                        status: p.status,
                        rejectionReason: p.rejectionReason || null,
                        createdAt: p.createdAt,
                    });
                }
            }
            console.log("✅ Polis data seeded with statuses (approved, pending, rejected) and reminders.");
        }

        // Seeding Watchdog Interactions
        console.log("🛡️ Seeding Watchdog Interactions...");
        const now = new Date();
        if (agent1 && profile1) {
            const interactions = [
                { nasabahId: profile1.userId, agentId: agent1.id, clickedAt: new Date(now.getTime() - 1000 * 60 * 1), isAdminNotified: false },
                { nasabahId: profile1.userId, agentId: agent1.id, clickedAt: new Date(now.getTime() - 1000 * 60 * 4), isAdminNotified: false },
                { nasabahId: profile1.userId, agentId: agent1.id, clickedAt: new Date(now.getTime() - 1000 * 60 * 10), isAdminNotified: false }
            ];
            for (const i of interactions) {
                await db.insert(waInteractions).values({
                    nasabahId: i.nasabahId,
                    agentId: i.agentId,
                    clickedAt: i.clickedAt,
                    isAdminNotified: i.isAdminNotified,
                });
            }
        }
        console.log("✅ Watchdog interactions seeded.");

        // Seeding Points Ledger for approved polis
        console.log("💰 Seeding Points Ledger...");
        if (profile1) {
            const polisForProfile1 = await db.select().from(polisData).where(eq(polisData.nasabahId, profile1.userId));
            for (const polis of polisForProfile1) {
                if (polis.status === "approved") {
                    const points = Math.floor(polis.premiumAmount / 1000);
                    const existingLedger = await db.select().from(pointsLedger)
                        .where(eq(pointsLedger.userId, profile1.userId))
                        .limit(1);
                    if (!existingLedger.length) {
                        await db.insert(pointsLedger).values({
                            userId: profile1.userId,
                            amount: points,
                            source: "purchase",
                            description: `Point reward dari Polis #${polis.polisNumber}`,
                            createdAt: polis.createdAt
                        });
                    }
                }
            }
        }
        console.log("✅ Points ledger seeded.");

        console.log("\n🎉 SEEDING COMPLETE!");
        console.log("\n📋 Test Accounts:");
        console.log("  Super Admin: super1@trisula.com / 123456");
        console.log("  Admin: admin1@trisula.com / 123456");
        console.log("  Agent: agent1@trisula.com / 123456 (userId: SULTAN01)");
        console.log("  Nasabah: hidung1@trisula.com / 123456");
        console.log("\n🔑 Available Agent Codes:", agentCodes.join(", "));

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        process.exit(0);
    }
}

seed();