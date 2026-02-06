import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import redeemRoutes from './routes/redeem.js';
import adminRoutes from './routes/admin.js';
import wealthRoutes from './routes/wealth.js';
import rewardsRoutes from './routes/rewards.js';

const app = new Hono();

// --- MIDDLEWARES ---
app.use('*', logger());
app.use('*', cors());

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator v1.0.0 (Bun Runtime)'));

// Debug Route
app.post('/api/v1/ping', async (c) => {
  console.log(`[DEBUG] PING (Lazy Init Test) received`);
  let body = {};
  try {
    body = await c.req.json();
  } catch (e) { }
  return c.json({ success: true, message: 'PONG (Lazy Init)', echo: body });
});

// Daftarkan route auth dengan prefix /api/v1
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/user', userRoutes);
app.route('/api/v1/redeem', redeemRoutes);
app.route('/api/v1/admin', adminRoutes);
app.route('/api/v1/wealth', wealthRoutes);
app.route('/api/v1/rewards', rewardsRoutes);

// --- ERROR HANDLING ---
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Route not found',
    debug: { method: c.req.method, path: c.req.path }
  }, 404);
});

app.onError((err, c) => {
  console.error(`[ERROR] ${err}`);
  return c.json({ success: false, message: 'Internal Server Error', error: err.message }, 500);
});

export default app;