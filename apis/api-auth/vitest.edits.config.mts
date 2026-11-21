import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

import authConfig from './vitest.config.mts'

// Collect the real owning services exercised by the HTTP integration suite.
// Keep this report separate from ordinary workspace and sharded unit coverage.
export default defineConfig({
  ...authConfig,
  root: fileURLToPath(new URL('../..', import.meta.url)),
  test: {
    ...authConfig.test,
    // Cross-service HTTP/database scenarios collect coverage on shared runners.
    testTimeout: 60000,
    exclude: ['**/node_modules/**', '**/.git/**'],
    include: [
      'apis/api-auth/test/grantedEdits.spec.ts',
      'libs/yoga/src/mcp/*.spec.ts',
      'apis/api-journeys/src/lib/mcpReadPage.spec.ts'
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: [
        'apis/api-auth/src/**/*.ts',
        'apis/api-mcp/src/**/*.ts',
        'apis/api-gateway/src/mcp*.ts',
        'apis/api-journeys/src/lib/mcp*.ts',
        'apis/api-journeys/src/lib/journeyRevision/*.ts',
        'libs/yoga/src/mcp/**/*.ts'
      ],
      exclude: ['**/*.spec.ts', '**/*.d.ts'],
      reporter: ['text', 'cobertura', 'json'],
      reportsDirectory: 'coverage/integration/mcp-edits'
    },
    reporters: ['default', 'json'],
    outputFile: { json: 'coverage/integration/mcp-edits/test-results.json' }
  }
})
