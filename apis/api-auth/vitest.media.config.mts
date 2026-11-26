import { defineConfig } from 'vitest/config'

import editsConfig from './vitest.edits.config.mts'

export default defineConfig({
  ...editsConfig,
  test: {
    ...editsConfig.test,
    testTimeout: 60000,
    include: [
      'apis/api-auth/test/grantedMedia.spec.ts',
      'libs/yoga/src/mcp/*.spec.ts',
      'apis/api-media/src/lib/mcpMediaProviders.spec.ts',
      'apis/api-journeys/src/lib/mcpMedia.spec.ts',
      'apis/api-journeys/src/lib/mcpStructure.spec.ts'
    ],
    coverage: {
      ...editsConfig.test?.coverage,
      include: [
        ...(editsConfig.test?.coverage?.include ?? []),
        'apis/api-media/src/lib/mcpMedia*.ts',
        'libs/prisma/media/src/client.ts',
        'libs/prisma/media/src/transactionScope.ts'
      ],
      reportsDirectory: 'coverage/integration/mcp-media'
    },
    outputFile: { json: 'coverage/integration/mcp-media/test-results.json' }
  }
})
