import { resolve } from 'node:path'

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: resolve(__dirname, '../..'),
      ignoreConfigErrors: true
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    reporters: ['default'],
    setupFiles: ['./test/prismaMock.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apis/api-analytics'
    },
    passWithNoTests: true
  }
})
