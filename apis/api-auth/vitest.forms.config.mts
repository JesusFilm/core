import { defineConfig } from 'vitest/config'

import structure from './vitest.structure.config.mts'

export default defineConfig({
  ...structure,
  test: {
    ...structure.test,
    fileParallelism: false,
    include: [
      ...(structure.test?.include ?? []),
      'apis/api-auth/test/grantedForms.spec.ts',
      'libs/yoga/src/mcp/formContract.spec.ts'
    ],
    coverage: {
      ...structure.test?.coverage,
      reportsDirectory: 'coverage/integration/mcp-forms'
    },
    outputFile: { json: 'coverage/integration/mcp-forms/test-results.json' }
  }
})
