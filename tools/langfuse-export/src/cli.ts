// Pure CLI argument + window + discriminator parsing for run.ts. Kept
// separate from run.ts (which has side-effecting orchestration) so the
// parsing logic is unit-testable without executing the pipeline.

import { DEFAULT_LOAD_TEST_REGEX, type NormalizeOptions } from './pipeline/normalize'
import type { DateWindow } from './types'

export interface CliOptions {
  days?: number
  from?: string
  to?: string
  discriminator: string
  model?: string
  throttleMs?: number
  llmScrub: boolean
  pdf: boolean
  debug: boolean
  help: boolean
}

export const USAGE = `Usage: pnpm exec tsx tools/langfuse-export/run.ts [options]

  --days N             window = last N days (default 14; mutually exclusive with --from/--to)
  --from ISO --to ISO  explicit window (both required together)
  --discriminator V    load-test exclusion: default | none | message:<regex> | journey:<csv> | tag:<csv>
                       (default = exclude known load-test probes; --environment is inert until NES-1688)
  --llm-scrub          run an extra LLM PII scrub pass (pending NES-1562 sign-off)
  --pdf                also render report.pdf (needs: pnpm exec playwright install chromium)
  --model ID           OpenRouter model id (default from env / google/gemini-2.5-flash-lite)
  --throttle MS        delay between Langfuse API calls (default 700ms; keep under ~100 req/min)
  --debug              also write records.ndjson (sanitised turns; never upload to Drive)
  -h, --help           print this help`

function requireValue(argv: string[], index: number, flag: string): string {
  const value = argv[index]
  if (value == null) throw new Error(`${flag} requires a value`)
  return value
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    discriminator: 'default',
    llmScrub: false,
    pdf: false,
    debug: false,
    help: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    switch (arg) {
      case '--days':
        options.days = Number(requireValue(argv, (index += 1), '--days'))
        break
      case '--from':
        options.from = requireValue(argv, (index += 1), '--from')
        break
      case '--to':
        options.to = requireValue(argv, (index += 1), '--to')
        break
      case '--discriminator':
        options.discriminator = requireValue(argv, (index += 1), '--discriminator')
        break
      case '--model':
        options.model = requireValue(argv, (index += 1), '--model')
        break
      case '--throttle':
        options.throttleMs = Number(requireValue(argv, (index += 1), '--throttle'))
        break
      case '--llm-scrub':
        options.llmScrub = true
        break
      case '--pdf':
        options.pdf = true
        break
      case '--debug':
        options.debug = true
        break
      case '-h':
      case '--help':
        options.help = true
        break
      default:
        throw new Error(`unknown argument: ${arg}`)
    }
  }

  // Validate --throttle here (not in resolveWindow): `Number('--pdf')` /
  // `Number('abc')` yield NaN, which the `?? DEFAULT` guard in langfuse.ts
  // does NOT catch, silently disabling the rate-limit delay.
  if (
    options.throttleMs != null &&
    (!Number.isFinite(options.throttleMs) || options.throttleMs < 0)
  ) {
    throw new Error(`invalid --throttle: ${String(options.throttleMs)} (expected a non-negative number of ms)`)
  }

  return options
}

const DAY_MS = 24 * 60 * 60 * 1000

export function resolveWindow(options: CliOptions): DateWindow {
  const hasRange = options.from != null || options.to != null
  if (hasRange && options.days != null) {
    throw new Error('--days cannot be combined with --from/--to')
  }

  if (hasRange) {
    if (options.from == null || options.to == null) {
      throw new Error('--from and --to must be provided together')
    }
    const from = new Date(options.from)
    const to = new Date(options.to)
    if (Number.isNaN(from.getTime())) throw new Error(`invalid --from date: ${options.from}`)
    if (Number.isNaN(to.getTime())) throw new Error(`invalid --to date: ${options.to}`)
    if (from.getTime() >= to.getTime()) throw new Error('--from must be before --to')
    return { from, to }
  }

  const days = options.days ?? 14
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error(`invalid --days: ${String(options.days)}`)
  }
  const to = new Date()
  const from = new Date(to.getTime() - days * DAY_MS)
  // A huge --days overflows to an Invalid Date; catch it here rather than
  // letting from.toISOString() throw an opaque RangeError later.
  if (Number.isNaN(from.getTime())) {
    throw new Error(`--days is too large: ${String(options.days)}`)
  }
  return { from, to }
}

export function parseDiscriminator(value: string): NormalizeOptions {
  if (value === 'none') return {}
  if (value === 'default') return { excludeMessageRegex: DEFAULT_LOAD_TEST_REGEX }

  const separatorIndex = value.indexOf(':')
  if (separatorIndex === -1) {
    throw new Error(
      `invalid --discriminator: ${value} (expected default | none | message:<regex> | journey:<csv> | tag:<csv>)`
    )
  }
  const kind = value.slice(0, separatorIndex)
  const rest = value.slice(separatorIndex + 1)
  const csv = (input: string): Set<string> =>
    new Set(
      input
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )

  switch (kind) {
    case 'message':
      return { excludeMessageRegex: new RegExp(rest, 'i') }
    case 'journey':
      return { excludeJourneyIds: csv(rest) }
    case 'tag':
      return { excludeTags: csv(rest) }
    default:
      throw new Error(
        `invalid --discriminator kind: ${kind} (expected message | journey | tag)`
      )
  }
}
