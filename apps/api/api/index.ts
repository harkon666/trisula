import { handle } from 'hono/vercel';
import app from '../src/index';

// Vercel Serverless Function Configuration
export const config = {
    runtime: 'edge',
};

// Export handler for Vercel
export default handle(app);
