import { defineConfig } from 'vitest/config'

import config from './vitest.config.mts'

export default defineConfig({
  ...config,
  test: {
    ...config.test,
    include: ['integration/**/*.spec.ts'],
    exclude: ['**/node_modules/**'],
    setupFiles: ['./test/reactEmailRenderMock.ts', './test/bullmqMock.ts'],
    env: {
      PG_DATABASE_URL_JOURNEYS:
        process.env.JOURNEY_PRIVACY_TEST_DATABASE_URL ?? ''
    },
    coverage: { enabled: false },
    testTimeout: 30_000,
    hookTimeout: 60_000
  }
})
