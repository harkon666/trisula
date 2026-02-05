import { getRequestListener } from '@hono/node-server';
// @ts-ignore
import app from './_build/index.js';

// Vercel Serverless Function Configuration
export const config = {
    runtime: 'nodejs',
};

// Export handler for Vercel Node.js Runtime
export default getRequestListener(app.fetch);
