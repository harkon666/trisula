import { Hono } from 'hono';

const app = new Hono();

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator (Minimal Test)'));

// Debug Route with body parsing
app.post('/api/v1/ping', async (c) => {
  console.log(`[DEBUG] PING received`);
  let body = {};
  try {
    body = await c.req.json();
  } catch (e) {
    console.error("Body parse error:", e.message);
  }
  return c.json({ success: true, message: 'PONG (Minimal)', echo: body });
});

// Export for Vercel
export default app;