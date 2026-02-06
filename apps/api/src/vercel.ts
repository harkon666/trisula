import { getRequestListener } from '@hono/node-server';
import app from './index';

export const config = {
    runtime: 'nodejs',
};

// Revert to @hono/node-server as it was more stable for no-body requests
export default getRequestListener(app.fetch);
