import app from './index.js';

export default async (request: Request) => {
  return await app.fetch(request);
};
