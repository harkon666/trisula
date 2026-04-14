import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/serverless.ts'],
  outDir: 'api',
  format: ['esm'],
  clean: true,
  noExternal: [/.*/],
  splitting: false,
});
