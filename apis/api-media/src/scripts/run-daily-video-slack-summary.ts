/**
 * Manual trigger for the daily video Slack summary (same logic as the worker).
 *
 * Usage (from repo root). Load secrets first — e.g. create `apis/api-media/.env` via
 * `pnpm exec nx run api-media:fetch-secrets` (needs `DOPPLER_API_MEDIA_TOKEN`), then:
 *
 *   set -a && source apis/api-media/.env && set +a && pnpm exec nx run api-media:run-daily-video-slack-summary
 *
 * Nx runs `prisma-media:prisma-generate` before the script. Same env + args with tsx only:
 *
 *   set -a && source apis/api-media/.env && set +a && pnpm exec tsx --tsconfig apis/api-media/tsconfig.app.json apis/api-media/src/scripts/run-daily-video-slack-summary.ts
 *
 * Optional positional as-of date:
 *   ... run-daily-video-slack-summary.ts 2026-03-20T12:00:00.000Z
 *
 * Explicit window bounds:
 *   ... run-daily-video-slack-summary.ts --start 2025-03-01T00:00:00.000Z --end 2025-04-01T00:00:00.000Z
 *
 * Report profile:
 *   ... run-daily-video-slack-summary.ts --profile production-managers
 *   ... run-daily-video-slack-summary.ts --profile data-lang
 *
 * If only --end is provided, start defaults to end-48h. Without explicit bounds, the daily delayed window is 48h-24h before the as-of date.
 */
import {
  isValidVideoSlackSummaryWindow,
  resolveVideoSlackSummaryWindow,
  sendDataLangVideoSummary,
  sendProductionManagerFlagshipSummary
} from '../lib/videoSlack'
import { logger } from '../logger'

type ReportProfileName = 'data-lang' | 'production-managers'

interface ParsedCliArgs {
  startIso?: string
  endIso?: string
  positionalAsOf?: string
  profile: ReportProfileName
}

function readFlagValue(argv: string[], index: number, flag: string): string {
  const value = argv[index]
  if (value == null || value.startsWith('--')) {
    throw new Error(`${flag} requires a value (ISO-8601 date string)`)
  }
  return value
}

function parseReportProfile(value: string): ReportProfileName {
  if (value === 'data-lang' || value === 'production-managers') {
    return value
  }
  throw new Error('--profile must be either data-lang or production-managers')
}

function parseCliArgs(argv: string[]): ParsedCliArgs {
  const parsed: ParsedCliArgs = { profile: 'data-lang' }
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
    if (arg === '--profile') {
      parsed.profile = parseReportProfile(
        readFlagValue(argv, i + 1, '--profile')
      )
      i++
      continue
    }
    if (arg.startsWith('--profile=')) {
      parsed.profile = parseReportProfile(arg.slice('--profile='.length))
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

  const { startDate, endDate } = resolveVideoSlackSummaryWindow({
    currentDate:
      parsed.endIso != null
        ? parseIso(parsed.endIso, 'end')
        : parsed.positionalAsOf != null
          ? parseIso(parsed.positionalAsOf, 'as-of')
          : new Date(),
    options: {
      startDate:
        parsed.startIso != null
          ? parseIso(parsed.startIso, 'start')
          : undefined,
      endDate:
        parsed.endIso != null ? parseIso(parsed.endIso, 'end') : undefined
    }
  })

  if (!isValidVideoSlackSummaryWindow({ startDate, endDate })) {
    throw new Error('--start must be less than or equal to --end')
  }

  logger.info(
    {
      profile: parsed.profile,
      windowStart: startDate.toISOString(),
      windowEnd: endDate.toISOString()
    },
    'Running daily summary window'
  )
  const options = {
    startDate,
    endDate,
    throwOnError: true
  }
  if (parsed.profile === 'production-managers') {
    await sendProductionManagerFlagshipSummary(endDate, logger, options)
    logger.info('sendProductionManagerFlagshipSummary finished')
    return
  }

  await sendDataLangVideoSummary(endDate, logger, options)
  logger.info('sendDataLangVideoSummary finished')
}

main().catch((error) => {
  logger.error({ error }, 'run-daily-video-slack-summary failed')
  process.exit(1)
})
