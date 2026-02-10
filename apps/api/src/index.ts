import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import redeemRoutes from './routes/redeem.js';
import adminRoutes from './routes/admin.js';
import productsRoutes from './routes/products.js';
import polisRoutes from './routes/polis.js';
import contentRoutes from './routes/content.js';
import monitoringRoutes from './routes/monitoring.js';
import dashboardRoutes from './routes/dashboard.js';
// import wealthRoutes from './routes/wealth.js';
// import rewardsRoutes from './routes/rewards.js';

import { authMiddleware } from './middlewares/auth.js';

const app = new Hono();
console.log(`🚀 API STARTED AT: ${new Date().toISOString()}`);

// --- MIDDLEWARES ---
app.use('*', logger()); // Monitoring request yang masuk
app.use('*', cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'https://trisula.vercel.app'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));
app.use('*', authMiddleware({ strict: false })); // Populate context user if token present

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator (Vercel Best Practice Test)'));

// Daftarkan route auth dengan prefix /api/v1
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/user', userRoutes);
app.route('/api/v1/redeem', redeemRoutes);
app.route('/api/v1/admin', adminRoutes);
app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/polis', polisRoutes);
app.route('/api/v1/content', contentRoutes);
app.route('/api/v1/monitoring', monitoringRoutes);
app.route('/api/v1/dashboard', dashboardRoutes);
// app.route('/api/v1/wealth', wealthRoutes);
// app.route('/api/v1/rewards', rewardsRoutes);
//
// --- ERROR HANDLING ---
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});

// Export for Vercel Serverless (default export)
export default app;