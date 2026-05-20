// Reusable load-test scenario runner for k6.
//
// Each scenario file (e.g. targets/chat.js) provides a request builder and
// calls `buildScenario()` to get k6 options + the default function + a
// handleSummary that writes a JSON result file under tools/load-test/results/.

import http from 'k6/http'
import { Counter, Trend } from 'k6/metrics'

// k6 cannot declare counters dynamically per-status at request time — they
// must be allocated in the init context. Pre-declare the codes we expect to
// see for HTTP APIs. Anything outside this list lands in `status_other` and
// gets a console.warn so the operator notices in the run output.
const TRACKED_2XX = [200, 201, 202, 204]
const TRACKED_4XX = [400, 401, 403, 404, 405, 408, 409, 413, 415, 422, 429]
const TRACKED_5XX = [500, 502, 503, 504]
const TRACKED_CODES = [...TRACKED_2XX, ...TRACKED_4XX, ...TRACKED_5XX]

const STATUS_COUNTERS = Object.fromEntries(
  TRACKED_CODES.map((code) => [code, new Counter(`status_${code}`)])
)
const STATUS_OTHER = new Counter('status_other')
const STATUS_ERROR = new Counter('status_error')
const LATENCY = new Trend('request_latency_ms', true)

const requiredEnv = (key) => {
  const value = __ENV[key]
  if (value == null || value === '')
    throw new Error(`Missing required env: ${key}`)
  return value
}

// `Number.parseInt` stops at the first non-digit ('10ms' -> 10), which would
// silently accept a malformed env value. Require digits-only before parsing.
const DIGITS_ONLY = /^\d+$/

const intEnv = (key, fallback) => {
  const raw = __ENV[key]
  if (raw == null || raw === '') return fallback
  if (!DIGITS_ONLY.test(raw))
    throw new Error(`${key} must be a positive integer (got: ${raw})`)
  const value = Number(raw)
  if (value <= 0)
    throw new Error(`${key} must be a positive integer (got: ${raw})`)
  return value
}

// MAX_ITERATIONS is the one knob where 0 is meaningful ("no cap") rather
// than invalid. Keep `intEnv` strict for rate/concurrency knobs and parse
// this one inline.
const nonNegativeIntEnv = (key, fallback) => {
  const raw = __ENV[key]
  if (raw == null || raw === '') return fallback
  if (!DIGITS_ONLY.test(raw))
    throw new Error(`${key} must be a non-negative integer (got: ${raw})`)
  return Number(raw)
}

const stringEnv = (key, fallback) => {
  const raw = __ENV[key]
  return raw == null || raw === '' ? fallback : raw
}

const isoNowSafe = () => new Date().toISOString().replace(/[:.]/g, '-')

const recordStatus = (status) => {
  if (status === 0) {
    STATUS_ERROR.add(1)
    return
  }
  const counter = STATUS_COUNTERS[status]
  if (counter != null) {
    counter.add(1)
    return
  }
  console.warn(`unexpected status code: ${status}`)
  STATUS_OTHER.add(1)
}

const count = (metrics, name) => Math.round(metrics[name]?.values?.count ?? 0)

const trend = (metrics, name, stat) =>
  Math.round(metrics[name]?.values?.[stat] ?? 0)

// Build a {code: count} map for every status with a non-zero observation.
// Includes 'other' and 'error' buckets when relevant.
const buildStatusBreakdown = (metrics) => {
  const breakdown = {}
  for (const code of TRACKED_CODES) {
    const value = count(metrics, `status_${code}`)
    if (value > 0) breakdown[String(code)] = value
  }
  const otherCount = count(metrics, 'status_other')
  if (otherCount > 0) breakdown.other = otherCount
  const errorCount = count(metrics, 'status_error')
  if (errorCount > 0) breakdown.error = errorCount
  return breakdown
}

const sumCodes = (metrics, codes) =>
  codes.reduce(
    (accumulator, code) => accumulator + count(metrics, `status_${code}`),
    0
  )

const buildSummaryBuckets = (metrics) => ({
  success_2xx: sumCodes(metrics, TRACKED_2XX),
  rate_limited_429: count(metrics, 'status_429'),
  client_errors_4xx_excluding_429: sumCodes(
    metrics,
    TRACKED_4XX.filter((code) => code !== 429)
  ),
  server_errors_5xx: sumCodes(metrics, TRACKED_5XX),
  network_errors: count(metrics, 'status_error'),
  unexpected: count(metrics, 'status_other')
})

const totalRequests = (breakdown) =>
  Object.values(breakdown).reduce(
    (accumulator, value) => accumulator + value,
    0
  )

const renderHumanSummary = (config, metrics, breakdown, buckets) => {
  const total = totalRequests(breakdown)
  const breakdownLines =
    Object.keys(breakdown).length === 0
      ? ['  (no responses recorded)']
      : Object.entries(breakdown)
          .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
          .map(([code, value]) => `  ${code.padStart(5)}: ${value}`)
  const lines = [
    '',
    `=== ${config.scenario} load-test summary ===`,
    `Run ID:    ${config.runId}`,
    `Target:    ${config.url}`,
    `Method:    ${config.method}`,
    `Rate:      ${config.rate}/${config.timeUnit}  (VUs ${config.vus}, max ${config.maxVus})`,
    `Duration:  ${config.duration}${config.maxIterations ? `  (cap ${config.maxIterations} reqs)` : ''}`,
    `Started:   ${config.startedAt}`,
    `Finished:  ${config.finishedAt}`,
    `Elapsed:   ${(config.durationMs / 1000).toFixed(2)}s`,
    `Result:    tools/load-test/results/${config.runId}.json`,
    '',
    `Total sent:    ${total}`,
    '',
    'By status:',
    ...breakdownLines,
    '',
    'Buckets:',
    `  2xx successes:           ${buckets.success_2xx}`,
    `  429 rate-limited:        ${buckets.rate_limited_429}   <- firewall success signal post-Log`,
    `  4xx other (client err):  ${buckets.client_errors_4xx_excluding_429}`,
    `  5xx (server err):        ${buckets.server_errors_5xx}`,
    `  network errors:          ${buckets.network_errors}`,
    `  unexpected codes:        ${buckets.unexpected}`,
    '',
    `Latency (ms):  p50=${trend(metrics, 'request_latency_ms', 'med')}  p95=${trend(metrics, 'request_latency_ms', 'p(95)')}  p99=${trend(metrics, 'request_latency_ms', 'p(99)')}  max=${trend(metrics, 'request_latency_ms', 'max')}`,
    ''
  ]
  return lines.join('\n')
}

const renderJsonSummary = (config, metrics, breakdown, buckets) => ({
  scenario: config.scenario,
  config,
  totals: {
    sent: totalRequests(breakdown),
    by_status: breakdown,
    buckets
  },
  latency_ms: {
    p50: trend(metrics, 'request_latency_ms', 'med'),
    p95: trend(metrics, 'request_latency_ms', 'p(95)'),
    p99: trend(metrics, 'request_latency_ms', 'p(99)'),
    max: trend(metrics, 'request_latency_ms', 'max'),
    avg: trend(metrics, 'request_latency_ms', 'avg')
  }
})

// Public: build the k6 module exports for a scenario.
//
// scenario: {
//   name: string,                       // e.g. 'chat'
//   buildRequest: ({ runId }) => {      // called per iteration with shared context
//     url?: string,                     // overrides URL env if provided
//     method?: 'POST' | 'GET' | ...,    // default POST
//     headers?: Record<string,string>,
//     body?: string                     // already JSON-stringified
//   }
// }
//
// `runId` is resolved once here (from RUN_ID env or a fallback derived from
// the scenario name). It is passed into `buildRequest` so targets cannot
// invent a second fallback that would drift from the result filename.
export const buildScenario = ({ name, buildRequest }) => {
  if (typeof name !== 'string' || name === '')
    throw new Error('scenario.name is required')
  if (typeof buildRequest !== 'function')
    throw new Error('scenario.buildRequest must be a function')

  const url = requiredEnv('URL')
  const rps = intEnv('RPS', 0)
  const rpm = intEnv('RPM', 0)
  if (rps === 0 && rpm === 0)
    throw new Error('Set either RPS or RPM (positive integer)')
  if (rps > 0 && rpm > 0)
    throw new Error('Set only one of RPS or RPM, not both')

  const rate = rps > 0 ? rps : rpm
  const timeUnit = rps > 0 ? '1s' : '1m'
  const vus = intEnv(
    'VUS',
    Math.max(5, Math.ceil(rate / (rpm > 0 ? 60 : 1)) * 2)
  )
  const maxVus = intEnv('MAX_VUS', Math.max(vus * 2, 20))
  const duration = stringEnv('DURATION', '30s')
  const maxIterations = nonNegativeIntEnv('MAX_ITERATIONS', 0)

  const runId = stringEnv('RUN_ID', `${name}-${isoNowSafe()}`)
  const config = {
    scenario: name,
    runId,
    url,
    method: 'POST',
    rate,
    timeUnit,
    vus,
    maxVus,
    duration,
    maxIterations: maxIterations || null,
    startedAt: null,
    finishedAt: null,
    durationMs: 0
  }

  const options = {
    discardResponseBodies: true,
    scenarios: {
      [name]: {
        executor: 'constant-arrival-rate',
        rate,
        timeUnit,
        duration,
        preAllocatedVUs: vus,
        maxVUs: maxVus,
        ...(maxIterations > 0 ? { maxIterations } : {})
      }
    },
    summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max']
  }

  const fn = () => {
    const request = buildRequest({ runId })
    const requestUrl = request.url ?? url
    const method = request.method ?? 'POST'
    const params = {
      headers: request.headers ?? { 'Content-Type': 'application/json' },
      timeout: '15s',
      tags: { scenario: name }
    }
    const response =
      method === 'GET'
        ? http.get(requestUrl, params)
        : http.request(method, requestUrl, request.body ?? null, params)
    LATENCY.add(response.timings.duration)
    recordStatus(response.status)
  }

  const handleSummary = (data) => {
    // k6 re-evaluates the init context when calling handleSummary, so any
    // wall-clock captured at init time is *not* the test start. Derive both
    // timestamps from data.state.testRunDurationMs, which is the authoritative
    // duration of the run.
    const finishedAtMs = Date.now()
    const durationMs = data.state?.testRunDurationMs ?? 0
    config.durationMs = Math.round(durationMs)
    config.startedAt = new Date(finishedAtMs - durationMs).toISOString()
    config.finishedAt = new Date(finishedAtMs).toISOString()

    const breakdown = buildStatusBreakdown(data.metrics)
    const buckets = buildSummaryBuckets(data.metrics)
    const human = renderHumanSummary(config, data.metrics, breakdown, buckets)
    const json = renderJsonSummary(config, data.metrics, breakdown, buckets)
    const filename = `tools/load-test/results/${runId}.json`
    return {
      stdout: human,
      [filename]: JSON.stringify(json, null, 2)
    }
  }

  return { options, fn, handleSummary }
}
