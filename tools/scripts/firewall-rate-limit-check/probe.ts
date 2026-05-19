// POST /api/chat in a loop, tally outcomes, write summary, fail on broken plumbing.
// 429 is NEVER a failure here — it's the success signal once the rule is past Log mode.

import { appendFile } from 'node:fs/promises'

const env = (key: string): string => {
  const value = process.env[key]
  if (value == null || value === '') throw new Error(`Missing env: ${key}`)
  return value
}
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

type Result = { status: number | null; error?: string }

const host = env('HOST')
const probeCount = Number.parseInt(env('PROBE_COUNT'), 10)
const probeRps = Number.parseFloat(env('PROBE_RPS'))
const runId = env('RUN_ID')

if (!Number.isInteger(probeCount) || probeCount <= 0)
  throw new Error(`PROBE_COUNT must be a positive integer (got: ${probeCount})`)
if (!Number.isFinite(probeRps) || probeRps <= 0)
  throw new Error(`PROBE_RPS must be a positive number (got: ${probeRps})`)

const url = `https://${host}/api/chat`
const body = JSON.stringify({
  messages: [{ role: 'user', content: 'firewall probe' }],
  sessionId: `firewall-probe-${runId}`
})
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': `nes-1581-firewall-probe/1.0 (gha; run=${runId})`
}
const sleepMs = 1000 / probeRps

console.log(`Probing ${url} — ${probeCount} requests at ~${probeRps} rps`)

const results: Result[] = []
for (let i = 1; i <= probeCount; i++) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10_000)
    })
    results.push({ status: response.status })
  } catch (error: unknown) {
    results.push({
      status: null,
      error: error instanceof Error ? error.message : String(error)
    })
  }
  if (i % 10 === 0) console.log(`  sent ${i}/${probeCount}`)
  if (i < probeCount) await sleep(sleepMs)
}

if (results.length === 0) {
  console.error('::error::Probe sent 0 requests')
  process.exit(1)
}

const total = results.length
const inRange = (lo: number, hi: number): number =>
  results.filter((r) => r.status != null && r.status >= lo && r.status <= hi)
    .length
const count2xx = inRange(200, 299)
const count4xx = inRange(400, 499)
const count429 = results.filter((r) => r.status === 429).length
const count5xx = inRange(500, 599)
const countError = results.filter((r) => r.status == null).length
const distribution = results.reduce<Record<string, number>>(
  (accumulator, result) => {
    const key = result.status?.toString() ?? 'ERR'
    accumulator[key] = (accumulator[key] ?? 0) + 1
    return accumulator
  },
  {}
)
const distributionString = Object.entries(distribution)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join(' ')

await appendFile(
  env('GITHUB_STEP_SUMMARY'),
  `
## Probe results

| Bucket | Count |
| --- | --- |
| Total sent | ${total} |
| 2xx | ${count2xx} |
| 429 (rate-limited — success signal post-Log) | ${count429} |
| Other 4xx | ${count4xx - count429} |
| 5xx | ${count5xx} |
| curl errors | ${countError} |

Status distribution: \`${distributionString}\`

_Note: a 429 count of 0 in **Log** mode is expected. Past Log mode, 429s above the configured threshold are the pass signal._
`
)

const errorPct = (countError * 100) / total
const fiveXxPct = (count5xx * 100) / total
let exitCode = 0
if (errorPct > 10) {
  console.error(`::error::curl error rate ${errorPct.toFixed(2)}% (> 10%)`)
  for (const result of results) if (result.error) console.error(result.error)
  exitCode = 1
}
if (fiveXxPct > 50) {
  console.error(
    `::error::5xx rate ${fiveXxPct.toFixed(2)}% (> 50%) — origin under stress`
  )
  exitCode = 1
}
process.exit(exitCode)
