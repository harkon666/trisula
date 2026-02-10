import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_key_change_me');

export const authMiddleware = (options = { strict: true }) => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log(`[AUTH] No Bearer token found in Header. Strict: ${options.strict}`);
            if (options.strict) {
                return c.json({ success: false, message: 'Unauthorized: Missing or invalid token format' }, 401);
            }
            return await next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            if (options.strict) {
                return c.json({ success: false, message: 'Unauthorized: Missing token' }, 401);
            }
            return await next();
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            // Map 'sub' back to 'id' for RBAC consistency if needed
            // Or just use payload as is
            const user = {
                id: payload.sub as string,
                userId: payload.userId as string,
                role: payload.role as string,
            };

            c.set('user', user);
            console.log(`[AUTH] Token Verified. User: ${user.userId}, Role: ${user.role}`);
            await next();
        } catch (error) {
            console.error("JWT Verify Error:", error);
            if (options.strict) {
                return c.json({ success: false, message: 'Unauthorized: Invalid or expired token' }, 401);
            }
            await next();
        }
    };
};
