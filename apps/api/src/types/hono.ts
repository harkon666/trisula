import { Context } from 'hono';

export interface AuthUser {
    id: string;
    userId: string;
    role: string;
}

export interface HonoContext extends Context {
    Variables: {
        user: AuthUser;
    };
}
