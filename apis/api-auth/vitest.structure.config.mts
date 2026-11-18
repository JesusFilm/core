import { defineConfig } from 'vitest/config'

import editsConfig from './vitest.edits.config.mts'

export default defineConfig({
  ...editsConfig,
  test: {
    ...editsConfig.test,
    include: [
      'apis/api-auth/test/grantedStructure.spec.ts',
      'apis/api-auth/test/http.spec.ts'
    ],
    coverage: {
      ...editsConfig.test?.coverage,
      include: [
        ...(editsConfig.test?.coverage?.include ?? []),
        'apis/api-journeys/src/schema/block/service.ts',
        'apis/api-journeys/src/schema/block/blockDelete.mutation.ts',
        'apis/api-journeys/src/schema/block/blockRestore.mutation.ts'
      ],
      reportsDirectory: 'coverage/integration/mcp-structure'
    },
    outputFile: { json: 'coverage/integration/mcp-structure/test-results.json' }
  }
})
