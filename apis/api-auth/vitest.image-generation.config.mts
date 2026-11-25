import { defineConfig } from 'vitest/config'

import uploadConfig from './vitest.image-upload.config.mts'

export default defineConfig({
  ...uploadConfig,
  test: {
    ...uploadConfig.test,
    include: [
      ...(uploadConfig.test?.include ?? []),
      'apis/api-media/src/lib/mcpImageGenerationProvider.spec.ts'
    ],
    coverage: {
      ...uploadConfig.test?.coverage,
      reportsDirectory: 'coverage/integration/mcp-image-generation'
    },
    outputFile: {
      json: 'coverage/integration/mcp-image-generation/test-results.json'
    }
  }
})
