import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      reporter: ['text', 'cobertura'],
      reportsDirectory: '../../coverage/apis/api-mcp'
    }
  }
})
