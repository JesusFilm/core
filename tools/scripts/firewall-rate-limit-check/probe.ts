/**
 * probe.ts — sends PROBE_COUNT POSTs to https://<HOST>/api/chat at ~PROBE_RPS
 * requests per second. Tallies outcomes and writes a summary table.
 *
 * Failure policy (matches the prior bash):
 *   - 429 is NEVER a failure — it is the success signal once the firewall rule
 *     is past Log mode.
 *   - Fail only on broken plumbing:
 *       * network/error rate > 10% of total, OR
 *       * 5xx rate > 50% of total.
 *
 * Reads env: HOST, PROBE_COUNT, PROBE_RPS, RUN_ID.
 */

import { appendFile } from 'node:fs/promises'

import type { ProbeSummary, RequestOutcome } from './types'

const REQUEST_TIMEOUT_MS = 10_000
const ERROR_RATE_THRESHOLD_PCT = 10
const FIVE_XX_RATE_THRESHOLD_PCT = 50

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function buildBody(runId: string): string {
  return JSON.stringify({
    messages: [{ role: 'user', content: 'firewall probe' }],
    sessionId: `firewall-probe-${runId}`
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendProbe(args: {
  url: string
  body: string
  userAgent: string
}): Promise<RequestOutcome> {
  try {
    const response = await fetch(args.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': args.userAgent
      },
      body: args.body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
    // Drain the body so the connection can be reused/closed cleanly.
    await response.arrayBuffer().catch(() => undefined)
    return { status: response.status, timeSeconds: 0 }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: null, timeSeconds: 0, error: message }
  }
}

function classify(outcomes: RequestOutcome[]): ProbeSummary {
  const distribution: Record<string, number> = {}
  let count2xx = 0
  let count429 = 0
  let count4xxAll = 0
  let count5xx = 0
  let countError = 0

  for (const outcome of outcomes) {
    if (outcome.status == null) {
      countError += 1
      distribution.ERR = (distribution.ERR ?? 0) + 1
      continue
    }
    const code = outcome.status
    const key = String(code)
    distribution[key] = (distribution[key] ?? 0) + 1
    if (code >= 200 && code <= 299) count2xx += 1
    if (code >= 400 && code <= 499) count4xxAll += 1
    if (code === 429) count429 += 1
    if (code >= 500 && code <= 599) count5xx += 1
  }

  return {
    total: outcomes.length,
    count2xx,
    count429,
    count4xxAll,
    count5xx,
    countError,
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
  summary: ProbeSummary
}): Promise<void> {
  const githubSummary = process.env.GITHUB_STEP_SUMMARY
  if (githubSummary == null || githubSummary === '') return
  const { summary } = args
  const otherFourXx = summary.count4xxAll - summary.count429
  const lines = [
    '',
    '## Probe results',
    '',
    '| Bucket | Count |',
    '| --- | --- |',
    `| Total sent | ${summary.total} |`,
    `| 2xx | ${summary.count2xx} |`,
    `| 429 (rate-limited — success signal post-Log) | ${summary.count429} |`,
    `| Other 4xx | ${otherFourXx} |`,
    `| 5xx | ${summary.count5xx} |`,
    `| curl errors | ${summary.countError} |`,
    '',
    `Status distribution: \`${formatDistribution(summary.distribution)}\``,
    '',
    '_Note: a 429 count of 0 in **Log** mode is expected. Past Log mode, 429s above the configured threshold are the pass signal._',
    ''
  ]
  await appendFile(githubSummary, lines.join('\n'))
}

function pct(part: number, total: number): number {
  if (total === 0) return 0
  return (part * 100) / total
}

function shouldFail(summary: ProbeSummary, errorMessages: string[]): boolean {
  let fail = false
  if (summary.countError > 0) {
    const errorPct = pct(summary.countError, summary.total)
    if (errorPct > ERROR_RATE_THRESHOLD_PCT) {
      console.error(
        `::error::curl error rate ${errorPct.toFixed(2)}% (> ${ERROR_RATE_THRESHOLD_PCT}%) — see errors below`
      )
      for (const message of errorMessages) console.error(message)
      fail = true
    }
  }
  if (summary.count5xx > 0) {
    const fiveXxPct = pct(summary.count5xx, summary.total)
    if (fiveXxPct > FIVE_XX_RATE_THRESHOLD_PCT) {
      console.error(
        `::error::5xx rate ${fiveXxPct.toFixed(2)}% (> ${FIVE_XX_RATE_THRESHOLD_PCT}%) — origin under stress`
      )
      fail = true
    }
  }
  return fail
}

async function main(): Promise<void> {
  const host = requireEnv('HOST')
  const probeCount = Number.parseInt(requireEnv('PROBE_COUNT'), 10)
  const probeRps = Number.parseFloat(requireEnv('PROBE_RPS'))
  const runId = requireEnv('RUN_ID')

  if (!Number.isFinite(probeCount) || probeCount <= 0) {
    throw new Error(
      `PROBE_COUNT must be a positive integer (got: ${probeCount})`
    )
  }
  if (!Number.isFinite(probeRps) || probeRps <= 0) {
    throw new Error(`PROBE_RPS must be a positive number (got: ${probeRps})`)
  }

  const url = `https://${host}/api/chat`
  const body = buildBody(runId)
  const userAgent = `nes-1581-firewall-probe/1.0 (gha; run=${runId})`
  const sleepMs = 1000 / probeRps

  console.log(
    `Probing ${url} — ${probeCount} requests at ~${probeRps} rps (sleep ${(sleepMs / 1000).toFixed(6)}s)`
  )

  const outcomes: RequestOutcome[] = []
  const errorMessages: string[] = []
  for (let i = 1; i <= probeCount; i += 1) {
    const outcome = await sendProbe({ url, body, userAgent })
    outcomes.push(outcome)
    if (outcome.error != null) errorMessages.push(outcome.error)
    if (i % 10 === 0) {
      console.log(`  sent ${i}/${probeCount}`)
    }
    if (i < probeCount) {
      await sleep(sleepMs)
    }
  }

  const summary = classify(outcomes)
  await writeSummary({ url, summary })

  const fail = shouldFail(summary, errorMessages)
  if (fail) process.exit(1)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
