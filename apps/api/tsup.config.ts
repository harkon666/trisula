import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'node20',
    outDir: 'api/_build',
    clean: true,
    noExternal: ['@repo/shared', '@repo/database'],
})
