import { defineConfig } from 'tsup'

export default defineConfig({
    entry: { index: 'src/vercel.ts' },
    format: ['esm'],
    target: 'node20',
    outDir: 'api', // Output directly to api directory
    clean: false, // Don't clean api dir
    bundle: true,
    noExternal: ['@repo/shared', '@repo/database', 'hono'],
    minify: false,
})
