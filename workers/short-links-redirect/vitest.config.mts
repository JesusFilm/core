import path from 'node:path'

import {
  cloudflareTest,
  readD1Migrations
} from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'

// The D1 schema under `d1/` is applied to the local D1 binding by
// `test/applyD1Migrations.ts` before every test file, so specs run against the
// real table definition rather than a copy of the DDL.
const migrations = await readD1Migrations(path.join(import.meta.dirname, 'd1'))

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
      miniflare: {
        bindings: { TEST_D1_MIGRATIONS: migrations }
      }
    })
  ],
  test: {
    globals: true,
    reporters: ['default'],
    setupFiles: ['./test/applyD1Migrations.ts']
  }
})
