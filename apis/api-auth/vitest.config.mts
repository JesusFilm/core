import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    dedupe: ['graphql'],
    // Pothos uses the CommonJS entry. Keep direct execution/recovery in that
    // same GraphQL realm instead of Vite selecting its separate ESM build.
    alias: {
      graphql: fileURLToPath(
        new URL('../../node_modules/graphql/index.js', import.meta.url)
      )
    }
  },
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    // Saved edits require their own prepared databases and dedicated config.
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/test/grantedEdits.spec.ts'
    ],
    globals: true,
    environment: 'node',
    testTimeout: 20000
  }
})
