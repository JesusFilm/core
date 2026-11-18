import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 120000,
    testTimeout: 20000,
    coverage: {
      enabled: true,
      // The HTTP harness imports the real gateway, MCP and Journeys owners.
      allowExternal: true,
      provider: 'v8',
      // Vitest 4 emptied coverage's include/exclude defaults and dropped
      // `coverage.all`. Restore the Vitest 3 report shape so untested source
      // still counts — see docs/agents/testing.md.
      include: ['**/*.{js,cjs,mjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/[.]**',
        '**/*.d.ts',
        'test?(s)/**',
        '**/__tests__/**',
        '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
      ],
      reporter: [
        [
          'cobertura',
          { projectRoot: fileURLToPath(new URL('../..', import.meta.url)) }
        ],
        'json'
      ],
      reportsDirectory: '../../coverage/apis/api-auth'
    }
  }
})
