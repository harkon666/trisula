import { db, users, profiles, rewards } from "./index";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        // Shared Password Hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("Sultan2026!", salt);
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

        // Drizzle doesn't have native "UPSERT" based on non-unique columns easily without constraints, 
        // so we just check count or ignore. For simplicity, we just insert if table empty or use onConflict if we had unique constraint on title.
        // Assuming no unique constraint on title in schema, so let's check first.

        for (const item of catalogItems) {
            // Simple check to avoid dupes purely by title for this seed script
            const existing = await db.query.rewards.findFirst({
                where: (rewards, { eq }) => eq(rewards.title, item.title),
            });

            if (!existing) {
                await db.insert(rewards).values(item);
            }
        }
        console.log("✅ Rewards seeded.");

        console.log("✨ Seeding completed successfully!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        // In bun/script context, we might need to manually close client or just exit
        process.exit(0);
    }
}

seed();
