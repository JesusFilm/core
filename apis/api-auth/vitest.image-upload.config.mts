import { defineConfig } from 'vitest/config'

import mediaConfig from './vitest.media.config.mts'

export default defineConfig({
  ...mediaConfig,
  test: {
    ...mediaConfig.test,
    include: [
      'apis/api-auth/test/grantedImageUpload.spec.ts',
      'apis/api-media/src/lib/mcpImageUploadAdapters.spec.ts',
      'apis/api-media/src/lib/mcpUploadStorage.spec.ts',
      'apis/api-media/src/lib/mcpMediaExecutor.spec.ts',
      'libs/yoga/src/mcp/*.spec.ts'
    ],
    coverage: {
      ...mediaConfig.test?.coverage,
      include: [
        ...(mediaConfig.test?.coverage?.include ?? []),
        'apis/api-media/src/lib/mcpImage*.ts',
        'apis/api-media/src/lib/mcpUpload*.ts'
      ],
      reportsDirectory: 'coverage/integration/mcp-image-upload'
    },
    outputFile: {
      json: 'coverage/integration/mcp-image-upload/test-results.json'
    }
  }
})
