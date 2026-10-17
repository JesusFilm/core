import { Logger } from 'pino'

import { runVerifyAvailableLanguages } from '../../scripts/verify-available-languages'

// Self-heals by default: this is a scheduled background job whose entire
// purpose is proving the availableLanguages invariant holds catalog-wide
// and repairing it when it doesn't, not just reporting -- report-only runs
// are for the manual CLI entrypoint (run-verify-available-languages.ts).
export async function service(logger?: Logger): Promise<void> {
  const result = await runVerifyAvailableLanguages({ fix: true }, logger)
  logger?.info(
    {
      checked: result.checked,
      mismatchCount: result.mismatchCount,
      fixedCount: result.fixedCount,
      unresolvedCount: result.unresolvedVideoIds.length,
      completed: result.completed
    },
    'availableLanguages verification completed'
  )
}
