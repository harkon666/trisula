import { Context, Next } from 'hono';
import { roleEnum } from '@repo/database';

type UserRole = (typeof roleEnum.enumValues)[number];

export const rbacMiddleware = () => {
    return async (c: Context, next: Next) => {
        // In a real scenario, user role is attached to context by auth middleware
        // For now, let's assume it's in c.get('user')?.role or we mock it for testing if needed
        // But per requirements, we need to handle specific logic.

        // We assume previous Auth Middleware has populated c.get('user')
        // If not, we should probably return 401, but let's focus on RBAC here.
        const user = c.get('user');

        if (!user || !user.role) {
            // If no user context, maybe 401 or let it pass if public route?
            // Assuming strict mode, return 401 Unauthorized
            return c.json({ success: false, message: 'Unauthorized: No user role found' }, 401);
        }

        const role = user.role as UserRole;
        const method = c.req.method;

        // Strict RBAC Logic
        if (role === 'super_admin') {
            await next();
            return;
        }

        if (role === 'admin_input') {
            if (method === 'POST') {
                await next();
                return;
            } else {
                return c.json({ success: false, message: 'Forbidden: Admin Input can only perform POST actions' }, 403);
            }
        }

        if (role === 'admin_view') {
            if (method === 'GET') {
                await next();
                return;
            } else {
                return c.json({ success: false, message: 'Forbidden: Admin View can only perform GET actions' }, 403);
            }
        }

        // Default allow for agent and nasabah, assuming route handlers have specific logic
        // or should we restrict them too?
        // The prompt says: "Admin 1 (Input-Only)... Admin 2 (View-Only)..."
        // It doesn't explicitly restrict Agent/Nasabah method-wise globally, 
        // but implies Agent accesses "Unique Activation Code" etc.
        // So we allow them to proceed to route handlers.
        if (role === 'agent' || role === 'nasabah') {
            await next();
            return;
        }

        return c.json({ success: false, message: 'Forbidden: Unknown Role' }, 403);
    };
};
