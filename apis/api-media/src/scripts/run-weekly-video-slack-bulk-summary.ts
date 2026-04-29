/**
 * Manual trigger for the condensed weekly video Slack bulk summary.
 *
 * Usage (from repo root). Load secrets first — e.g. create `apis/api-media/.env` via
 * `pnpm exec nx run api-media:fetch-secrets` (needs `DOPPLER_API_MEDIA_TOKEN`), then:
 *
 *   set -a && source apis/api-media/.env && set +a && pnpm exec nx run api-media:run-weekly-video-slack-bulk-summary
 *
 * Optional positional as-of date:
 *   ... run-weekly-video-slack-bulk-summary.ts 2026-03-20T12:00:00.000Z
 *
 * Explicit window bounds:
 *   ... run-weekly-video-slack-bulk-summary.ts --start 2025-03-01T00:00:00.000Z --end 2025-04-01T00:00:00.000Z
 */
import { postBulkVideoSlackMessages } from '../lib/videoSlackBulkRenderer'
import { loadBulkVideoReport } from '../lib/videoSlackBulkReport'
import {
  isValidWeeklyVideoSummaryWindow,
  resolveWeeklyVideoSummaryWindow
} from '../lib/videoSlackReport'
import { logger } from '../logger'

interface ParsedCliArgs {
  startIso?: string
  endIso?: string
  positionalAsOf?: string
}

function readFlagValue(argv: string[], index: number, flag: string): string {
  const value = argv[index]
  if (value == null || value.startsWith('--')) {
    throw new Error(`${flag} requires a value (ISO-8601 date string)`)
  }
  return value
}

function parseCliArgs(argv: string[]): ParsedCliArgs {
  const parsed: ParsedCliArgs = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--start') {
      parsed.startIso = readFlagValue(argv, i + 1, '--start')
      i++
      continue
    }
    if (arg.startsWith('--start=')) {
      parsed.startIso = arg.slice('--start='.length)
      continue
    }
    if (arg === '--end') {
      parsed.endIso = readFlagValue(argv, i + 1, '--end')
      i++
      continue
    }
    if (arg.startsWith('--end=')) {
      parsed.endIso = arg.slice('--end='.length)
      continue
    }
    if (parsed.positionalAsOf == null) {
      parsed.positionalAsOf = arg
    }
  }
  return parsed
}

function parseIso(value: string, label: string): Date {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(
      `Invalid ${label} date. Pass an ISO-8601 string, e.g. 2026-03-20T12:00:00.000Z`
    )
  }
  return parsed
}

async function main(): Promise<void> {
  const parsed = parseCliArgs(process.argv.slice(2))
  if (
    parsed.positionalAsOf != null &&
    (parsed.startIso != null || parsed.endIso != null)
  ) {
    throw new Error(
      'Use either a positional as-of date OR --start/--end flags, not both'
    )
  }

  const { startDate, endDate } = resolveWeeklyVideoSummaryWindow({
    currentDate:
      parsed.endIso != null
        ? parseIso(parsed.endIso, 'end')
        : parsed.positionalAsOf != null
          ? parseIso(parsed.positionalAsOf, 'as-of')
          : new Date(),
    options: {
      startDate:
        parsed.startIso != null ? parseIso(parsed.startIso, 'start') : undefined,
      endDate:
        parsed.endIso != null ? parseIso(parsed.endIso, 'end') : undefined
    }
  })

  if (!isValidWeeklyVideoSummaryWindow({ startDate, endDate })) {
    throw new Error('--start must be less than or equal to --end')
  }

  console.log(
    `Running weekly bulk summary window: ${startDate.toISOString()} -> ${endDate.toISOString()}`
  )
  const rows = await loadBulkVideoReport({ startDate, endDate })
  if (rows.length === 0) {
    logger.info(
      {
        windowStart: startDate.toISOString(),
        windowEnd: endDate.toISOString()
      },
      'Bulk video Slack summary skipped: no videos changed in the window'
    )
    return
  }
  await postBulkVideoSlackMessages({ rows, startDate, endDate, childLogger: logger })
  console.log('postBulkVideoSlackMessages finished')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
