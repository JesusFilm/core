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
  resolve: {
    dedupe: ['graphql'],
    alias: [
      {
        find: /^.+\/env$/,
        replacement: resolve(__dirname, 'test/env.mock.ts')
      }
    ]
  },
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test'
    },
    reporters: ['default'],
    setupFiles: [
      resolve(__dirname, 'test/reactEmailRenderMock.ts'),
      resolve(__dirname, 'test/prismaMock.ts')
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apis/api-journeys-modern'
    },
    pool: 'forks',
    passWithNoTests: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**']
  }
})
