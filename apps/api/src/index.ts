import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import redeemRoutes from './routes/redeem.js';
import adminRoutes from './routes/admin.js';
import wealthRoutes from './routes/wealth.js';

const app = new Hono();
console.log(`🚀 API STARTED AT: ${new Date().toISOString()}`);

// --- MIDDLEWARES ---
app.use('*', logger()); // Monitoring request yang masuk
app.use('*', cors());   // Mengizinkan akses dari Frontend (Next.js)

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator v1.0.0 (Bun Runtime)'));

// Daftarkan route auth dengan prefix /api/v1
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/user', userRoutes);
app.route('/api/v1/redeem', redeemRoutes);
app.route('/api/v1/admin', adminRoutes);
app.route('/api/v1/wealth', wealthRoutes);

// --- ERROR HANDLING ---
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});

// Export for Vercel Serverless (default export)
export default app;