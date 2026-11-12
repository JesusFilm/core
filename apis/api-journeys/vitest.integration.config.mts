import { resolve } from 'node:path'

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths({ root: resolve(__dirname, '../..') })],
  resolve: {
    dedupe: ['graphql'],
    alias: [
      { find: /^.+\/env$/, replacement: resolve(__dirname, 'test/env.mock.ts') }
    ]
  },
  test: {
    globals: true,
    environment: 'node',
    env: { NODE_ENV: 'test' },
    include: ['**/*.integration.spec.ts'],
    setupFiles: [resolve(__dirname, 'test/bullmqMock.ts')],
    hookTimeout: 60000,
    testTimeout: 15000,
    coverage: { enabled: false }
  }
})
