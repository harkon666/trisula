import { Hono } from 'hono';

// Best Practice: Use basePath if you're rewriting /api/(.*) to this function
const app = new Hono().basePath('/api');

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator (Vercel Best Practice Test)'));

// SUCCESS: No body parsing
app.post('/v1/ping-sync', (c) => {
  return c.json({ success: true, message: 'Sync PONG (Best Practice)' });
});

// TEST: Reading body using Hono's standard way with hono/vercel adapter
app.post('/v1/ping-async', async (c) => {
  console.log("[DEBUG] Async ping started (Best Practice)");
  try {
    // Try raw request first as it's the most standard-compliant
    const body = await c.req.raw.json();
    console.log("[DEBUG] Body read success (Raw)");
    return c.json({ success: true, message: 'Async PONG (Raw JSON)', echo: body });
  } catch (e: any) {
    try {
      // Fallback to wrapper
      const body = await c.req.json();
      console.log("[DEBUG] Body read success (Wrapper)");
      return c.json({ success: true, message: 'Async PONG (Wrapper JSON)', echo: body });
    } catch (e2: any) {
      console.error("[DEBUG] Body read error:", e2.message);
      return c.json({ success: false, message: 'Body read failed', error: e2.message, error1: e.message });
    }
  }
});

export default app;