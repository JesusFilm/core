/**
 * Manual trigger for the availableLanguages batch verifier (same logic as
 * the scheduled worker). Report-only by default; pass --fix to self-heal
 * any mismatch found.
 *
 * Usage (from repo root):
 *
 *   pnpm exec nx run api-media:verify-available-languages
 *   pnpm exec nx run api-media:verify-available-languages -- --fix
 */
import { logger } from '../logger'

import { runVerifyAvailableLanguages } from './verify-available-languages'

async function main(): Promise<void> {
  const fix = process.argv.includes('--fix')
  const result = await runVerifyAvailableLanguages({ fix }, logger)
  logger.info({ result }, 'availableLanguages verification result')
}

main().catch((error) => {
  logger.error({ error }, 'run-verify-available-languages failed')
  process.exit(1)
})
