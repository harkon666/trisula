import { Context, Next } from 'hono';
import { db, users, roleEnum } from '@repo/database';
import { eq } from 'drizzle-orm';

type UserRole = (typeof roleEnum.enumValues)[number];

export const rbacMiddleware = (moduleName?: string) => {
    return async (c: Context, next: Next) => {
        // In a real scenario, user role is attached to context by auth middleware
        // For now, let's assume it's in c.get('user')?.role or we mock it for testing if needed
        // But per requirements, we need to handle specific logic.

        // We assume previous Auth Middleware has populated c.get('user')
        // If not, we should probably return 401, but let's focus on RBAC here.
        const user = c.get('user');

        if (!user || !user.role) {
            console.log(`[RBAC] Access Denied: User context missing or role not found for ${c.req.path}`);
            return c.json({ success: false, message: 'Unauthorized: No user role found' }, 401);
        }

        const role = user.role as UserRole;
        const method = c.req.method;

        // Strict RBAC Logic
        if (role === 'super_admin') {
            await next();
            return;
        }

        // Dynamic RBAC Logic for admin roles
        if (role === 'admin') {
            const requiredPermission = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? 'write' : 'read';

            // Fetch fresh metadata from database to get the latest permissions instantly
            const [freshUser] = await db.select({
                additionalMetadata: users.additionalMetadata
            }).from(users).where(eq(users.id, user.id)).limit(1);

            const permissionsObj: Record<string, string[]> | undefined = (freshUser?.additionalMetadata as any)?.permissions;

            // Check dynamic module permissions if moduleName is provided
            if (moduleName && permissionsObj && permissionsObj[moduleName]) {
                const modulePermissions = permissionsObj[moduleName];

                if (modulePermissions.includes(requiredPermission)) {
                    await next();
                    return;
                }

                // If they have the permissions object AND this module is explicitly defined but lacks this specific access, deny immediately.
                return c.json({
                    success: false,
                    message: `Forbidden: Lacks '${requiredPermission}' permission for module '${moduleName}'`
                }, 403);
            }

            // Deny by default if module is missing or permission is lacking
            return c.json({
                success: false,
                message: `Forbidden: Lacks '${requiredPermission}' permission for module '${moduleName}' or module not configured.`
            }, 403);
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
