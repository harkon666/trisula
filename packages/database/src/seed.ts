import { db, users, agents, pointsBalance, redeemCatalog } from "./index";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        // Shared Password Hash
        const passwordHash = await Bun.password.hash("Sultan2026!", {
            algorithm: "argon2id",
            memoryCost: 65536,
            timeCost: 2,
        });

        const usersToSeed = [
            {
                name: "Agent Primary",
                email: "agent1@trisula.com",
                role: "agent",
                walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
                referralCode: "SULTAN01",
                balance: 1000
            },
            {
                name: "Admin User",
                email: "admin1@trisula.com",
                role: "admin",
                walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat Account #1
                referralCode: "ADMIN01",
                balance: 0
            },
            {
                name: "Super Admin",
                email: "super1@trisula.com",
                role: "super_admin",
                walletAddress: "0x1C78F045EC6A57724503F054360b0EEff15a067B",
                referralCode: "SUPER01",
                balance: 999999
            },
            {
                name: "Dev Wallet",
                email: "dev@trisula.com",
                role: "super_admin",
                walletAddress: "0x162b329d330f2641594d36fc75305e985e645810",
                referralCode: "DEV01",
                balance: 1000000
            }
        ];

        for (const u of usersToSeed) {
            // Check existence
            const existing = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, u.email),
            });

            if (existing) {
                console.log(`⚠️ User ${u.email} already exists. Skipping.`);
                continue;
            }

            // Insert User
            const [newUser] = await db.insert(users).values({
                name: u.name,
                email: u.email,
                passwordHash,
                phone: "628123456789",
                city: "Jakarta",
                walletAddress: u.walletAddress,
                role: u.role as any,
                status: "active",
            }).returning();

            console.log(`✅ User created: ${newUser.id} (${u.role})`);

            // If Agent, create agent record (Admins might not need it unless they refer people too?)
            // Let's give everyone a referral code just in case or strict to Agent role?
            // Schema: agents table links userId.
            // Let's insert for everyone so they can refer.
            await db.insert(agents).values({
                userId: newUser.id,
                referralCode: u.referralCode,
            });
            console.log(`   Referral Code: ${u.referralCode}`);

            // Initialize Balance
            await db.insert(pointsBalance).values({
                userId: newUser.id,
                balance: u.balance,
            });
        }

        console.log("✅ Users & Balances initialized.");

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
