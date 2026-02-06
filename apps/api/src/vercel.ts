import { handle } from 'hono/vercel';
import app from './index.js';

// This is the entry point for Vercel
export default handle(app);
