import { Hono } from 'hono';

const app = new Hono();

// --- ROUTES ---
app.get('/', (c) => c.text('TRISULA API Orchestrator (Body Fix Test)'));

// SUCCESS: This should work if POST is fine but stream is broken
app.post('/api/v1/ping-sync', (c) => {
  return c.json({ success: true, message: 'Sync PONG' });
});

// TEST: Reading body via ArrayBuffer to avoid c.req.json() hang
app.post('/api/v1/ping-async', async (c) => {
  console.log("[DEBUG] Async ping started");
  try {
    // ArrayBuffer is often more reliable on Node.js streams
    const arrayBuffer = await c.req.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);
    const body = text ? JSON.parse(text) : {};

    console.log("[DEBUG] Body read success");
    return c.json({ success: true, message: 'Async PONG (ArrayBuffer)', echo: body });
  } catch (e: any) {
    console.error("[DEBUG] Body read error:", e.message);
    return c.json({ success: false, message: 'Body read failed', error: e.message });
  }
});

// Export for Vercel
export default app;