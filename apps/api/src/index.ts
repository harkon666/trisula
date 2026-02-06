import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
/*
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import redeemRoutes from './routes/redeem.js';
import adminRoutes from './routes/admin.js';
import wealthRoutes from './routes/wealth.js';
import rewardsRoutes from './routes/rewards.js';
*/

const app = new Hono();
console.log(`🚀 API STARTED AT: ${new Date().toISOString()}`);

// --- MIDDLEWARES ---
// All middlewares disabled for isolation test
// app.use('*', logger());
// app.use('*', cors());

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator v1.0.0 (Bun Runtime) - Isolation Test'));

// Version 1: No Body Parsing
app.post('/api/v1/ping-no-body', async (c) => {
  console.log(`[DEBUG] PING (No Body) received`);
  return c.json({ success: true, message: 'PONG (No Body)' });
});

// Version 2: With Body Parsing
app.post('/api/v1/ping-with-body', async (c) => {
  console.log(`[DEBUG] PING (With Body) received`);
  try {
    const body = await c.req.json();
    return c.json({ success: true, message: 'PONG (With Body)', echo: body });
  } catch (e: any) {
    return c.json({ success: false, message: 'Body parsing failed', error: e.message });
  }
});

/*
// Daftarkan route auth dengan prefix /api/v1
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/user', userRoutes);
app.route('/api/v1/redeem', redeemRoutes);
app.route('/api/v1/admin', adminRoutes);
app.route('/api/v1/wealth', wealthRoutes);
app.route('/api/v1/rewards', rewardsRoutes);
*/

// --- ERROR HANDLING ---
app.notFound((c) => {
  console.log(`[DEBUG] 404 Not Found: ${c.req.method} ${c.req.path}`);
  return c.json({
    success: false,
    message: 'Route not found (Custom Handler)',
    debug: {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path
    }
  }, 404);
});

app.onError((err, c) => {
  console.error(`[ERROR] ${err}`);
  return c.json({ success: false, message: 'Internal Server Error', error: err.message }, 500);
});

// Export for Vercel Serverless (default export)
export default app;