import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import redeemRoutes from './routes/redeem';
import adminRoutes from './routes/admin';

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

// --- ERROR HANDLING ---
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});

export default {
  port: 3000,
  fetch: app.fetch,
};