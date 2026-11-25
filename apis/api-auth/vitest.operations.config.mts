import { defineConfig } from 'vitest/config'

import uploadConfig from './vitest.image-upload.config.mts'

const controlsOnly = process.env.MCP_OPERATIONS_ONLY_CONTROLS === 'true'
const reportsDirectory = `coverage/integration/mcp-operations${controlsOnly ? '-controls' : ''}`

export default defineConfig({
  ...uploadConfig,
  test: {
    ...uploadConfig.test,
    fileParallelism: false,
    include: [
      ...(controlsOnly ? [] : (uploadConfig.test?.include ?? [])),
      'apis/api-auth/test/operations.spec.ts',
      'apis/api-auth/src/config.spec.ts',
      'apis/api-mcp/src/release.spec.ts',
      'tools/scripts/mcp-release.spec.mjs',
      'tools/scripts/mcp-operations.spec.mjs'
    ],
    coverage: {
      ...uploadConfig.test?.coverage,
      include: [
        ...(uploadConfig.test?.coverage?.include ?? []),
        'apis/api-mcp/src/release.ts',
        'tools/scripts/mcp-release.mjs',
        'tools/scripts/mcp-operations.mjs'
      ],
      reportsDirectory
    },
    outputFile: {
      json: `${reportsDirectory}/test-results.json`
    }
  }
})
