import { getRequestListener } from '@hono/node-server';
import app from '../dist/index.js';

// Vercel Serverless Function Configuration
export const config = {
    runtime: 'nodejs',
};

// Export handler for Vercel Node.js Runtime
export default getRequestListener(app.fetch);
