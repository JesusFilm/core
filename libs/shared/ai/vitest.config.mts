import { resolve } from 'node:path'

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: resolve(__dirname, '../../..'),
      ignoreConfigErrors: true
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    reporters: ['default'],
    retry: process.env.CI === 'true' ? 3 : 0,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../../coverage/libs/shared/ai'
    },
    passWithNoTests: true
  }
})
