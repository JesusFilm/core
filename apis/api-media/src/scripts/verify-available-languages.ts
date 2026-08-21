// Driver loop for verifyAvailableLanguages: threads its resumable cursor
// through repeated bounded calls (mirroring mux-videos.ts's cursor-paginated
// backfill loop) until the whole catalog has been walked, aggregating the
// results into one summary. Used by both the on-demand CLI entrypoint
// (run-verify-available-languages.ts) and the scheduled worker
// (workers/verifyAvailableLanguages).
import { Logger } from 'pino'

import {
  VerifyAvailableLanguagesCursor,
  verifyAvailableLanguages
} from '../schema/video/lib/verifyAvailableLanguages'

export interface RunVerifyAvailableLanguagesOptions {
  fix?: boolean
  pageSize?: number
  // Safety cap on how many bounded verifyAvailableLanguages calls this
  // driver will make in one run. Each call is already bounded by pageSize;
  // this bounds how many of those calls a single invocation makes, so a
  // catalog that somehow never converges can't turn one script/worker run
  // into an unbounded loop -- it just reports incomplete and picks up again
  // on the next scheduled run.
  maxCalls?: number
}

export interface RunVerifyAvailableLanguagesResult {
  checked: number
  mismatchCount: number
  fixedCount: number
  unresolvedVideoIds: string[]
  // False if maxCalls was hit before the walk reached the end of the
  // catalog -- the remaining work simply wasn't attempted this run.
  completed: boolean
}

const DEFAULT_MAX_CALLS = 1000

export async function runVerifyAvailableLanguages(
  options: RunVerifyAvailableLanguagesOptions = {},
  logger?: Logger
): Promise<RunVerifyAvailableLanguagesResult> {
  const maxCalls = options.maxCalls ?? DEFAULT_MAX_CALLS

  let cursor: VerifyAvailableLanguagesCursor | null = null
  let checked = 0
  let mismatchCount = 0
  let fixedCount = 0
  let unresolvedVideoIds: string[] = []
  let calls = 0

  do {
    const result = await verifyAvailableLanguages({
      fix: options.fix,
      pageSize: options.pageSize,
      cursor
    })

    checked += result.checked
    mismatchCount += result.mismatches.length
    fixedCount += result.fixed.length
    unresolvedVideoIds = result.unresolvedVideoIds
    cursor = result.nextCursor
    calls++

    logger?.info(
      {
        checked,
        mismatchCount,
        fixedCount,
        done: cursor == null
      },
      'availableLanguages verification progress'
    )
  } while (cursor != null && calls < maxCalls)

  return {
    checked,
    mismatchCount,
    fixedCount,
    unresolvedVideoIds,
    completed: cursor == null
  }
}
