import { defineConfig } from 'vitest/config'

import editsConfig from './vitest.edits.config.mts'

export default defineConfig({
  ...editsConfig,
  test: {
    ...editsConfig.test,
    include: [
      'apis/api-auth/test/grantedAppearance.spec.ts',
      'libs/yoga/src/mcp/appearanceContract.spec.ts',
      'apis/api-journeys/src/lib/mcpContentFeatures.spec.ts'
    ],
    coverage: {
      ...editsConfig.test?.coverage,
      include: [
        ...(editsConfig.test?.coverage?.include ?? []),
        'libs/shared/ui/src/libs/fontFamilies/*.ts'
      ],
      reportsDirectory: 'coverage/integration/mcp-appearance'
    },
    outputFile: {
      json: 'coverage/integration/mcp-appearance/test-results.json'
    }
  }
})
