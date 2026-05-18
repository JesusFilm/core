// GET sentinel path at ~1 req/sec for duration_seconds, track p50/p95, fail
// if any response is non-2xx or p95 >= 3.0s. Mirrors the probe shape.

import { appendFile } from 'node:fs/promises'
import { performance } from 'node:perf_hooks'

const env = (key: string): string => {
  const value = process.env[key]
  if (value == null || value === '') throw new Error(`Missing env: ${key}`)
  return value
}
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

type Result = { status: number | null; ms: number; error?: string }

const host = env('HOST')
const durationSeconds = Number.parseInt(env('DURATION_SECONDS'), 10)
const sentinelPath = '/' + env('SENTINEL_PATH').replace(/^\/+/, '')

if (!Number.isFinite(durationSeconds) || durationSeconds <= 0)
  throw new Error(
    `DURATION_SECONDS must be a positive integer (got: ${durationSeconds})`
  )

const url = `https://${host}${sentinelPath}`
console.log(`Sentinel: GET ${url} for ~${durationSeconds}s at ~1 req/sec`)

const endAt = Date.now() + durationSeconds * 1000
const results: Result[] = []
let i = 0
while (Date.now() < endAt) {
  i++
  const t0 = performance.now()
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'nes-1581-firewall-sentinel/1.0 (gha)' },
      signal: AbortSignal.timeout(15_000)
    })
    results.push({ status: response.status, ms: performance.now() - t0 })
  } catch (error: unknown) {
    results.push({
      status: null,
      ms: 0,
      error: error instanceof Error ? error.message : String(error)
    })
  }
  if (i % 15 === 0) console.log(`  sentinel sent ${i} requests`)
  await sleep(1000)
}

if (results.length === 0) {
  console.error('::error::Sentinel sent 0 requests')
  process.exit(1)
}

const total = results.length
const count2xx = results.filter(
  (r) => r.status != null && r.status >= 200 && r.status <= 299
).length
const countError = results.filter((r) => r.status == null).length
const successPct = (count2xx * 100) / total

// p50 / p95 over successful requests only (numpy "lower" interpolation),
// matching the original awk: index = floor((N-1) * fraction) + 1, clamped to N.
const sortedMs = results
  .filter((r) => r.ms > 0)
  .map((r) => r.ms)
  .sort((a, b) => a - b)
const percentile = (fraction: number): number => {
  if (sortedMs.length === 0) return 0
  const index = Math.min(
    Math.floor((sortedMs.length - 1) * fraction),
    sortedMs.length - 1
  )
  return sortedMs[index]
}
const p50Seconds = percentile(0.5) / 1000
const p95Seconds = percentile(0.95) / 1000

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
## Sentinel results

| Metric | Value |
| --- | --- |
| URL | \`${url}\` |
| Total requests | ${total} |
| 2xx | ${count2xx} |
| curl errors | ${countError} |
| Success rate | ${successPct.toFixed(2)}% |
| p50 latency (s) | ${p50Seconds.toFixed(3)} |
| p95 latency (s) | ${p95Seconds.toFixed(3)} |

Status distribution: \`${distributionString}\`
`
)

let exitCode = 0
if (count2xx !== total) {
  console.error(
    `::error::Sentinel saw non-2xx responses (${count2xx}/${total} were 2xx). Legit traffic is being affected.`
  )
  exitCode = 1
}
if (p95Seconds >= 3.0) {
  console.error(
    `::error::Sentinel p95 latency ${p95Seconds.toFixed(3)}s >= 3.0s threshold`
  )
  exitCode = 1
}
process.exit(exitCode)
