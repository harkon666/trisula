import { Hono } from 'hono';

const app = new Hono();

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator (Sync Test)'));

// SUCCESS: This should work if POST is fine but stream is broken
app.post('/api/v1/ping-sync', (c) => {
  return c.json({ success: true, message: 'Sync PONG' });
});

// TEST: This is the one we think hangs
app.post('/api/v1/ping-async', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, message: 'Async PONG', echo: body });
});

// Export for Vercel
export default app;