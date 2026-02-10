import { describe, expect, it, beforeAll } from 'bun:test';
import { db, agentActivationCodes, users } from '@repo/database';
import { eq } from 'drizzle-orm';
import app from '../src/index';

const TEST_CODE = 'TEST_CODE_12345';
const TEST_AGENT_ID = 'test_agent_01';
const TEST_NASABAH_ID = 'test_nasabah_01';

describe('Auth Integration Tests', () => {

    beforeAll(async () => {
        console.log("🛠️ Starting Cleanup...");
        // 1. Cleanup
        try {
            await db.delete(agentActivationCodes).where(eq(agentActivationCodes.code, TEST_CODE));
            console.log("✅ Cleanup done (or skipped if empty)");
            // Users might have foreign keys preventing simple delete.
            // For now, assume fresh run or ignore errors if not exists.
            // Actually, schema reset happened before.
        } catch (e) {
            console.log("⚠️ Cleanup skipped/failed", e);
        }

        // 2. Create Activation Code
        console.log("🛠️ Creating Activation Code...");
        try {
            await db.insert(agentActivationCodes).values({
                code: TEST_CODE,
                isUsed: false,
            });
            console.log("✅ Activation Code created");
        } catch (e) {
            console.error("❌ Failed to create activation code:", e);
            throw e;
        }
    });

    it('should register an AGENT with valid code', async () => {
        const res = await app.request('/api/v1/auth/register/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: TEST_AGENT_ID,
                password: 'password123',
                fullName: 'Test Agent',
                whatsapp: '081234567890',
                activationCode: TEST_CODE
            })
        });

        const body = await res.json();
        expect(res.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.userId).toBe(TEST_AGENT_ID);
    });

    it('should FAIL to register agent with used code', async () => {
        const res = await app.request('/api/v1/auth/register/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'agent_fail',
                password: 'password123',
                fullName: 'Fail Agent',
                whatsapp: '081234567890',
                activationCode: TEST_CODE // Already used above
            })
        });

        expect(res.status).toBe(400); // Bad Request
    });

    it('should register a NASABAH with valid referral', async () => {
        const res = await app.request('/api/v1/auth/register/nasabah', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: TEST_NASABAH_ID,
                password: 'password123',
                fullName: 'Test Nasabah',
                whatsapp: '081234567891',
                referredByAgentId: TEST_AGENT_ID
            })
        });

        const body = await res.json();
        expect(res.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.userId).toBe(TEST_NASABAH_ID);
    });

    it('should LOGIN and get token + daily bonus', async () => {
        const res = await app.request('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: TEST_NASABAH_ID,
                password: 'password123'
            })
        });

        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.token).toBeDefined();
        // Daily bonus + Welcome (100) + Daily (10) = 110?
        // Wait, points logic: welcome=100. update(users).set(points).
        // Login -> processDailyLogin -> update users +10.
        // Total should be 110.
        expect(body.user.points).toBe(110);
    });
});
