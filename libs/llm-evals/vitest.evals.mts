import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['eval.spec.ts'],
    setupFiles: ['./setupEvals.ts'],
    reporters: ['verbose'],
    passWithNoTests: false,
    testTimeout: 120_000,
    hookTimeout: 60_000,
    retry: 0
  }
})
