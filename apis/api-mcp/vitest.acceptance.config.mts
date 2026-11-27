import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

import base from './vitest.config.mts'

export default defineConfig({
  ...base,
  root: fileURLToPath(new URL('../..', import.meta.url)),
  test: {
    ...base.test,
    include: [
      'apis/api-mcp/src/acceptance.spec.ts',
      'tools/scripts/mcp-acceptance.spec.mjs'
    ],
    reporters: ['default', 'json'],
    outputFile: {
      json: 'coverage/integration/mcp-acceptance/test-results.json'
    },
    coverage: {
      ...base.test?.coverage,
      include: [
        'apis/api-mcp/src/acceptance.ts',
        'tools/scripts/mcp-acceptance.mjs',
        'tools/scripts/mcp-acceptance-config.mjs',
        'tools/scripts/mcp-acceptance-local.mjs'
      ],
      exclude: ['**/*.spec.ts', '**/*.spec.mjs'],
      reporter: [
        'text',
        [
          'cobertura',
          { projectRoot: fileURLToPath(new URL('../..', import.meta.url)) }
        ],
        'json'
      ],
      reportsDirectory: 'coverage/integration/mcp-acceptance'
    }
  }
})
