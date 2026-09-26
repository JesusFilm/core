import { type D1Migration, applyD1Migrations, env } from 'cloudflare:test'

/**
 * Vitest setup file: applies `d1/*.sql` (read by `vitest.config.mts` via
 * `readD1Migrations` and passed in as the `TEST_D1_MIGRATIONS` binding) to the
 * local D1 database before each test file runs.
 */
interface MigrationEnv {
  SHORT_LINKS_DB: D1Database
  TEST_D1_MIGRATIONS: D1Migration[]
}

const migrationEnv = env as unknown as MigrationEnv

await applyD1Migrations(
  migrationEnv.SHORT_LINKS_DB,
  migrationEnv.TEST_D1_MIGRATIONS
)
