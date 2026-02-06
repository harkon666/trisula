import { getRequestListener } from '@hono/node-server';
import app from './index.js';

// Use @hono/node-server for Vercel Node.js runtime compatibility
export default getRequestListener(app.fetch);

export const config = {
    runtime: 'nodejs',
};
