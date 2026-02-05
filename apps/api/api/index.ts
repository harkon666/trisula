import { getRequestListener } from '@hono/node-server';
// @ts-ignore - this file is generated at build time
import app from '../dist/index.js';

// Vercel Serverless Function Configuration
export const config = {
    runtime: 'nodejs',
};

// Export handler for Vercel Node.js Runtime
export default getRequestListener(app.fetch);
