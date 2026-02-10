import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { rbacMiddleware } from '../src/middlewares/rbac';

// Mock Auth Middleware to inject user role
const mockAuth = (role: string) => async (c: any, next: any) => {
    c.set('user', { role });
    await next();
};

describe('RBAC Middleware', () => {
    const app = new Hono();

    // Setup routes for testing
    // We need to verify different roles against different methods

    // Generic protected route
    app.all('/protected/*', async (c, next) => {
        const role = c.req.header('x-role');
        if (role) {
            c.set('user', { role }); // Simulate auth
        }
        await next();
    }, rbacMiddleware(), (c) => c.json({ message: 'Allowed' }));

    it('should allow super_admin to GET', async () => {
        const res = await app.request('/protected/resource', {
            method: 'GET',
            headers: { 'x-role': 'super_admin' }
        });
        expect(res.status).toBe(200);
    });

    it('should allow super_admin to POST', async () => {
        const res = await app.request('/protected/resource', {
            method: 'POST',
            headers: { 'x-role': 'super_admin' }
        });
        expect(res.status).toBe(200);
    });

    // Admin Input (POST only)
    it('should allow admin_input to POST', async () => {
        const res = await app.request('/protected/resource', {
            method: 'POST',
            headers: { 'x-role': 'admin_input' }
        });
        expect(res.status).toBe(200);
    });

    it('should DENY admin_input to GET', async () => {
        const res = await app.request('/protected/resource', {
            method: 'GET',
            headers: { 'x-role': 'admin_input' }
        });
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.message).toContain('Admin Input can only perform POST');
    });

    // Admin View (GET only)
    it('should allow admin_view to GET', async () => {
        const res = await app.request('/protected/resource', {
            method: 'GET',
            headers: { 'x-role': 'admin_view' }
        });
        expect(res.status).toBe(200);
    });

    it('should DENY admin_view to POST', async () => {
        const res = await app.request('/protected/resource', {
            method: 'POST',
            headers: { 'x-role': 'admin_view' }
        });
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.message).toContain('Admin View can only perform GET');
    });

    // Unauthorized (No Role)
    it('should return 401 if no user role', async () => {
        const res = await app.request('/protected/resource', {
            method: 'GET'
            // No header
        });
        expect(res.status).toBe(401);
    });
});
