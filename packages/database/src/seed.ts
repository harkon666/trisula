import { db, users, agents, pointsBalance, redeemCatalog } from "./index";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        const agentEmail = "agent1@trisula.com";
        const referralCode = "SULTAN01";

        // 1. Check if agent already exists
        const existingAgent = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, agentEmail),
        });

        if (existingAgent) {
            console.log("⚠️ Agent already exists. Skipping user creation.");
            return;
        }

        // 2. Hash password
        const passwordHash = await Bun.password.hash("Sultan2026!", {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 2,
        });

        // 3. Insert User
        const [newUser] = await db.insert(users).values({
            name: "Agent Primary",
            email: agentEmail,
            passwordHash,
            phone: "628123456789",
            city: "Jakarta",
            walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
            role: "agent",
            status: "active",
        }).returning();

        if (!newUser) throw new Error("Failed to create user");
        console.log(`✅ User created: ${newUser.id}`);

        // 4. Insert Agent record
        const [newAgent] = await db.insert(agents).values({
            userId: newUser.id,
            referralCode: referralCode,
        }).returning();

        if (!newAgent) throw new Error("Failed to create agent");
        console.log(`✅ Agent record created: ${newAgent.referralCode}`);

        // 5. Initialize Balance
        await db.insert(pointsBalance).values({
            userId: newUser.id,
            balance: 1000, // Starting bonus for agent
        });

        console.log("✅ Points balance initialized.");

        // 6. Seed Redeem Catalog
        console.log("🎁 Seeding Redeem Catalog...");
        const catalogItems = [
            { name: "Voucher Kopi Premium", pointsRequired: 50, description: "Nikmati kopi spesial racikan barista terbaik." },
            { name: "E-Money Rp 100.000", pointsRequired: 1000, description: "Saldo E-Money untuk kebutuhan transaksi harian Anda." },
            { name: "Trisula Exclusive Merch", pointsRequired: 500, description: "Kaos eksklusif komunitas Trisula." },
            { name: "Mystery Box", pointsRequired: 200, description: "Kotak kejutan berisi hadiah menarik." },
            { name: "Samsung Galaxy S24", pointsRequired: 50000, description: "Smartphone flagship untuk member sultan." },
        ];

        for (const item of catalogItems) {
            await db.insert(redeemCatalog).values(item).onConflictDoNothing();
        }
        console.log("✅ Catalog seeded.");

        console.log("✨ Seeding completed successfully!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        process.exit();
    }
}

seed();
