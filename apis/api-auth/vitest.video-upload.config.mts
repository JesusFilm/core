import { defineConfig } from 'vitest/config'
import mediaConfig from './vitest.media.config.mts'
export default defineConfig({
  ...mediaConfig,
  test: {
    ...mediaConfig.test,
    include: [
      'apis/api-auth/test/grantedVideoUpload.spec.ts',
      'apis/api-media/src/lib/mcpVideoProvider.spec.ts',
      'libs/yoga/src/mcp/*.spec.ts'
    ],
    coverage: {
      ...mediaConfig.test?.coverage,
      include: [
        ...(mediaConfig.test?.coverage?.include ?? []),
        'apis/api-media/src/lib/mcpVideo*.ts',
        'apis/api-media/src/lib/mcpUpload*.ts'
      ],
      reportsDirectory: 'coverage/integration/mcp-video-upload'
    },
    outputFile: {
      json: 'coverage/integration/mcp-video-upload/test-results.json'
    }
  }
})
