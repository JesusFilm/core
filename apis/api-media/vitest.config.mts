import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [tsconfigPaths({ root: resolve(__dirname, '../..'), ignoreConfigErrors: true })],
  resolve: {
    alias: {
      graphql: require.resolve('graphql')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    reporters: ['default'],
    env: {
      NODE_ENV: 'test'
    },
    setupFiles: [
      './test/crowdinMock.ts',
      './test/bullmqMock.ts',
      './test/prismaMock.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['cobertura'],
      reportsDirectory: '../../coverage/apis/api-media'
    },
    passWithNoTests: true
  }
})
