/**
 * Manual trigger for the weekly video Slack summary (same logic as the worker).
 *
 * Usage (from repo root — nx runs prisma-generate first):
 *   pnpm exec nx run api-media:run-weekly-video-slack-summary
 *
 * Or with tsx directly (generate client first: nx run prisma-media:prisma-generate):
 *   set -a && source apis/api-media/.env && set +a && pnpm exec tsx --tsconfig apis/api-media/tsconfig.app.json apis/api-media/src/scripts/run-weekly-video-slack-summary.ts
 *
 * Optional positional as-of date:
 *   ... run-weekly-video-slack-summary.ts 2026-03-20T12:00:00.000Z
 *
 * Explicit window bounds:
 *   ... run-weekly-video-slack-summary.ts --start 2025-03-01T00:00:00.000Z --end 2025-04-01T00:00:00.000Z
 *
 * If only --end is provided, start defaults to end-7d.
 */
import { sendWeeklyVideoSummary } from '../lib/videoSlack'
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

function parseCliArgs(argv: string[]): ParsedCliArgs {
  const parsed: ParsedCliArgs = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--start') {
      parsed.startIso = argv[i + 1]
      i++
      continue
    }
    if (arg.startsWith('--start=')) {
      parsed.startIso = arg.slice('--start='.length)
      continue
    }
    if (arg === '--end') {
      parsed.endIso = argv[i + 1]
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
    `Running weekly summary window: ${startDate.toISOString()} -> ${endDate.toISOString()}`
  )
  await sendWeeklyVideoSummary(endDate, logger, { startDate, endDate })
  console.log('sendWeeklyVideoSummary finished')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
