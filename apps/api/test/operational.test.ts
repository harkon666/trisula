import { describe, expect, it, beforeAll } from "bun:test";
import app from "../src/index";
import { db, users, products, polisData } from "@repo/database";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_key_change_me');
const CRON_SECRET = process.env.CRON_SECRET || 'secure_cron_secret_123';

describe("Operational Features Integration Tests", () => {
    let adminToken: string;
    let agentToken: string;
    let adminUserId: string;
    let agentUserId: string;

    beforeAll(async () => {
        console.log("🛠️ Starting setup for Operational Tests...");
        // Setup Admin User
        const adminId = "admin_op_test";
        console.log(`🔍 Checking if admin ${adminId} exists...`);
        const [existingAdmin] = await db.select().from(users).where(eq(users.userId, adminId));
        let adminUser = existingAdmin;

        if (!existingAdmin) {
            console.log(`🆕 Creating admin ${adminId}...`);
            [adminUser] = await db.insert(users).values({
                userId: adminId,
                password: "hashed_password",
                role: "super_admin",
                isActive: true
            }).returning();
            console.log("✅ Admin created");
        } else {
            console.log("✅ Admin exists");
        }
        adminUserId = adminUser.id;

        // Setup Agent User
        const agentId = "agent_op_test";
        console.log(`🔍 Checking if agent ${agentId} exists...`);
        const [existingAgent] = await db.select().from(users).where(eq(users.userId, agentId));
        let agentUser = existingAgent;

        if (!existingAgent) {
            console.log(`🆕 Creating agent ${agentId}...`);
            [agentUser] = await db.insert(users).values({
                userId: agentId,
                password: "hashed_password",
                role: "agent",
                isActive: true
            }).returning();
            console.log("✅ Agent created");
        } else {
            console.log("✅ Agent exists");
        }
        agentUserId = agentUser.id;

        // Generate Tokens
        console.log("🔑 Generating tokens...");
        adminToken = await new SignJWT({ sub: adminUser.id, role: adminUser.role, userId: adminUser.userId })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(JWT_SECRET);

        agentToken = await new SignJWT({ sub: agentUser.id, role: agentUser.role, userId: agentUser.userId })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(JWT_SECRET);
        console.log("✅ Tokens generated");
    });

    // --- Product Management ---
    it("should allow Admin to create a product", async () => {
        const res = await app.request("/api/v1/products", {
            method: "POST",
            headers: { "Authorization": `Bearer ${adminToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test Product",
                pointsReward: 100,
                description: "Test Description"
            })
        });
        expect(res.status).toBe(201);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.name).toBe("Test Product");
    });

    it("should allow Public to list products", async () => {
        const res = await app.request("/api/v1/products");
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBeGreaterThan(0);
    });

    // --- Polis Management ---
    it("should allow Admin to input polis", async () => {
        const res = await app.request("/api/v1/polis", {
            method: "POST",
            headers: { "Authorization": `Bearer ${adminToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                polisNumber: `POL-${Date.now()}`,
                nasabahId: adminUserId, // Using admin as nasabah for simplicity/mock
                agentId: agentUserId,
                premiumAmount: 500000
            })
        });

        // Note: adminUserId might not pass if logic checks strict role 'nasabah' in Users table? 
        // Route doesn't enforce role check on ID existence, just existence in Users table. 
        // Logic: const [nasabah] = await db.select().from(users).where(eq(users.id, nasabahId)).limit(1);
        // It should pass.

        expect(res.status).toBe(201);
        const json = await res.json();
        expect(json.success).toBe(true);
    });

    // --- Dashboard ---
    it("should return dashboard stats for Admin", async () => {
        const res = await app.request("/api/v1/dashboard/stats", {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.totalUsers).toBeDefined();
        expect(json.data.totalPolis).toBeGreaterThanOrEqual(1); // Since we just added one
    });

    // --- Monitoring ---
    it("should block Watchdog without secret", async () => {
        const res = await app.request("/api/v1/monitoring/watchdog", {
            method: "POST"
        });
        expect(res.status).toBe(401);
    });

    it("should allow Watchdog with secret", async () => {
        const res = await app.request("/api/v1/monitoring/watchdog", {
            method: "POST",
            headers: { "Authorization": `Bearer ${CRON_SECRET}` }
        });
        // Might return 200 "No stale interactions" or "Processed X"
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
    });
});
