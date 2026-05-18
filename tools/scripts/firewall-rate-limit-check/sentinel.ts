/**
 * sentinel.ts — GETs https://<HOST><SENTINEL_PATH> at ~1 req/sec for
 * DURATION_SECONDS seconds while the probe job is running in parallel. The
 * point is to answer: does legit traffic still survive while the firewall is
 * busy challenging /api/chat?
 *
 * Pass criteria (matches the prior bash):
 *   - 100% of responses are 2xx, AND
 *   - p95 latency < 3.0s (over successful requests only — errored rows are
 *     excluded so they cannot make p95 look artificially low).
 *
 * Reads env: HOST, DURATION_SECONDS, SENTINEL_PATH.
 */

import { appendFile } from 'node:fs/promises'

import type { RequestOutcome, SentinelSummary } from './types'

const REQUEST_TIMEOUT_MS = 15_000
const TICK_INTERVAL_MS = 1_000
const P95_LATENCY_THRESHOLD_SECONDS = 3.0
const USER_AGENT = 'nes-1581-firewall-sentinel/1.0 (gha)'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Normalise the path so it has exactly one leading slash. */
function normalisePath(rawPath: string): string {
  return '/' + rawPath.replace(/^\/+/, '')
}

async function sendSentinel(url: string): Promise<RequestOutcome> {
  const startedAt = performance.now()
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
    await response.arrayBuffer().catch(() => undefined)
    const timeSeconds = (performance.now() - startedAt) / 1000
    return { status: response.status, timeSeconds }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: null, timeSeconds: 0, error: message }
  }
}

/**
 * Replicates the bash percentile: sort ascending, index = floor((N-1) * pct) + 1,
 * clamped to N. Returns 0 if the sample is empty.
 */
function percentile(sortedAscending: number[], fraction: number): number {
  const n = sortedAscending.length
  if (n === 0) return 0
  let index = Math.floor((n - 1) * fraction) + 1
  if (index > n) index = n
  return sortedAscending[index - 1]
}

function summarise(outcomes: RequestOutcome[]): SentinelSummary {
  const distribution: Record<string, number> = {}
  let count2xx = 0
  let countError = 0
  const successfulTimes: number[] = []

  for (const outcome of outcomes) {
    if (outcome.status == null) {
      countError += 1
      distribution.ERR = (distribution.ERR ?? 0) + 1
      continue
    }
    const key = String(outcome.status)
    distribution[key] = (distribution[key] ?? 0) + 1
    if (outcome.status >= 200 && outcome.status <= 299) count2xx += 1
    if (outcome.timeSeconds > 0) successfulTimes.push(outcome.timeSeconds)
  }

  successfulTimes.sort((a, b) => a - b)
  const total = outcomes.length
  const successPct = total === 0 ? 0 : (count2xx * 100) / total

  return {
    total,
    count2xx,
    countError,
    successPct,
    p50Seconds: percentile(successfulTimes, 0.5),
    p95Seconds: percentile(successfulTimes, 0.95),
    distribution
  }
}

function formatDistribution(distribution: Record<string, number>): string {
  return Object.keys(distribution)
    .sort()
    .map((key) => `${key}=${distribution[key]}`)
    .join(' ')
}

async function writeSummary(args: {
  url: string
  summary: SentinelSummary
}): Promise<void> {
  const githubSummary = process.env.GITHUB_STEP_SUMMARY
  if (githubSummary == null || githubSummary === '') return
  const { summary } = args
  const lines = [
    '',
    '## Sentinel results',
    '',
    '| Metric | Value |',
    '| --- | --- |',
    `| URL | \`${args.url}\` |`,
    `| Total requests | ${summary.total} |`,
    `| 2xx | ${summary.count2xx} |`,
    `| curl errors | ${summary.countError} |`,
    `| Success rate | ${summary.successPct.toFixed(2)}% |`,
    `| p50 latency (s) | ${summary.p50Seconds.toFixed(3)} |`,
    `| p95 latency (s) | ${summary.p95Seconds.toFixed(3)} |`,
    '',
    `Status distribution: \`${formatDistribution(summary.distribution)}\``,
    ''
  ]
  await appendFile(githubSummary, lines.join('\n'))
}

async function main(): Promise<void> {
  const host = requireEnv('HOST')
  const durationSeconds = Number.parseInt(requireEnv('DURATION_SECONDS'), 10)
  const sentinelPath = requireEnv('SENTINEL_PATH')

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(
      `DURATION_SECONDS must be a positive integer (got: ${durationSeconds})`
    )
  }

  const normalisedPath = normalisePath(sentinelPath)
  const url = `https://${host}${normalisedPath}`

  console.log(`Sentinel: GET ${url} for ~${durationSeconds}s at ~1 req/sec`)
  const endAt = Date.now() + durationSeconds * 1000
  const outcomes: RequestOutcome[] = []
  let i = 0
  while (Date.now() < endAt) {
    i += 1
    const outcome = await sendSentinel(url)
    outcomes.push(outcome)
    if (i % 15 === 0) {
      console.log(`  sentinel sent ${i} requests`)
    }
    await sleep(TICK_INTERVAL_MS)
  }

  if (outcomes.length === 0) {
    console.error(
      '::error::Sentinel sent 0 requests — duration too short or all requests failed'
    )
    process.exit(1)
  }

  const summary = summarise(outcomes)
  await writeSummary({ url, summary })

  let fail = false
  if (summary.count2xx !== summary.total) {
    console.error(
      `::error::Sentinel saw non-2xx responses (${summary.count2xx}/${summary.total} were 2xx). Legit traffic is being affected.`
    )
    fail = true
  }
  if (summary.p95Seconds >= P95_LATENCY_THRESHOLD_SECONDS) {
    console.error(
      `::error::Sentinel p95 latency ${summary.p95Seconds.toFixed(3)}s >= ${P95_LATENCY_THRESHOLD_SECONDS.toFixed(1)}s threshold`
    )
    fail = true
  }
  if (fail) process.exit(1)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
