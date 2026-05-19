// Reusable load-test scenario runner for k6.
//
// Each scenario file (e.g. scenarios/chat.js) provides a request builder and
// calls `buildScenario()` to get k6 options + the default function + a
// handleSummary that writes a JSON result file under tools/load-test/results/.

import http from 'k6/http'
import { Counter, Trend } from 'k6/metrics'

const STATUS_2XX = new Counter('status_2xx')
const STATUS_4XX_OTHER = new Counter('status_4xx_other')
const STATUS_429 = new Counter('status_429')
const STATUS_5XX = new Counter('status_5xx')
const STATUS_ERROR = new Counter('status_error')
const LATENCY = new Trend('request_latency_ms', true)

const requiredEnv = (key) => {
  const value = __ENV[key]
  if (value == null || value === '') throw new Error(`Missing required env: ${key}`)
  return value
}

const intEnv = (key, fallback) => {
  const raw = __ENV[key]
  if (raw == null || raw === '') return fallback
  const value = Number.parseInt(raw, 10)
  if (!Number.isInteger(value) || value <= 0)
    throw new Error(`${key} must be a positive integer (got: ${raw})`)
  return value
}

const stringEnv = (key, fallback) => {
  const raw = __ENV[key]
  return raw == null || raw === '' ? fallback : raw
}

const isoNowSafe = () => new Date().toISOString().replace(/[:.]/g, '-')

const recordStatus = (status) => {
  if (status === 0) {
    STATUS_ERROR.add(1)
    return 'error'
  }
  if (status >= 200 && status < 300) {
    STATUS_2XX.add(1)
    return '2xx'
  }
  if (status === 429) {
    STATUS_429.add(1)
    return '429'
  }
  if (status >= 400 && status < 500) {
    STATUS_4XX_OTHER.add(1)
    return '4xx'
  }
  if (status >= 500) {
    STATUS_5XX.add(1)
    return '5xx'
  }
  STATUS_ERROR.add(1)
  return 'error'
}

const count = (metrics, name) =>
  Math.round(metrics[name]?.values?.count ?? 0)

const trend = (metrics, name, stat) =>
  Math.round(metrics[name]?.values?.[stat] ?? 0)

const renderHumanSummary = (config, metrics) => {
  const total =
    count(metrics, 'status_2xx') +
    count(metrics, 'status_4xx_other') +
    count(metrics, 'status_429') +
    count(metrics, 'status_5xx') +
    count(metrics, 'status_error')
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
    `Result:    tools/load-test/results/${config.runId}.json`,
    '',
    `Total sent:    ${total}`,
    `  2xx:         ${count(metrics, 'status_2xx')}`,
    `  429:         ${count(metrics, 'status_429')}   <- rate-limited (firewall success signal post-Log)`,
    `  Other 4xx:   ${count(metrics, 'status_4xx_other')}`,
    `  5xx:         ${count(metrics, 'status_5xx')}`,
    `  errors:      ${count(metrics, 'status_error')}`,
    '',
    `Latency (ms):  p50=${trend(metrics, 'request_latency_ms', 'med')}  p95=${trend(metrics, 'request_latency_ms', 'p(95)')}  p99=${trend(metrics, 'request_latency_ms', 'p(99)')}  max=${trend(metrics, 'request_latency_ms', 'max')}`,
    ''
  ]
  return lines.join('\n')
}

const renderJsonSummary = (config, metrics) => {
  const total =
    count(metrics, 'status_2xx') +
    count(metrics, 'status_4xx_other') +
    count(metrics, 'status_429') +
    count(metrics, 'status_5xx') +
    count(metrics, 'status_error')
  return {
    scenario: config.scenario,
    config,
    totals: {
      sent: total,
      status_2xx: count(metrics, 'status_2xx'),
      status_429: count(metrics, 'status_429'),
      status_4xx_other: count(metrics, 'status_4xx_other'),
      status_5xx: count(metrics, 'status_5xx'),
      errors: count(metrics, 'status_error')
    },
    latency_ms: {
      p50: trend(metrics, 'request_latency_ms', 'med'),
      p95: trend(metrics, 'request_latency_ms', 'p(95)'),
      p99: trend(metrics, 'request_latency_ms', 'p(99)'),
      max: trend(metrics, 'request_latency_ms', 'max'),
      avg: trend(metrics, 'request_latency_ms', 'avg')
    }
  }
}

// Public: build the k6 module exports for a scenario.
//
// scenario: {
//   name: string,                       // e.g. 'chat'
//   buildRequest: () => {               // called per iteration
//     url?: string,                     // overrides URL env if provided
//     method?: 'POST' | 'GET' | ...,    // default POST
//     headers?: Record<string,string>,
//     body?: string                     // already JSON-stringified
//   }
// }
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
  const vus = intEnv('VUS', Math.max(5, Math.ceil(rate / (rpm > 0 ? 60 : 1)) * 2))
  const maxVus = intEnv('MAX_VUS', Math.max(vus * 2, 20))
  const duration = stringEnv('DURATION', '30s')
  const maxIterations = intEnv('MAX_ITERATIONS', 0)

  const startedAt = new Date().toISOString()
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
    startedAt,
    finishedAt: null
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
    const request = buildRequest()
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
    config.finishedAt = new Date().toISOString()
    const human = renderHumanSummary(config, data.metrics)
    const json = renderJsonSummary(config, data.metrics)
    const filename = `tools/load-test/results/${runId}.json`
    return {
      stdout: human,
      [filename]: JSON.stringify(json, null, 2)
    }
  }

  return { options, fn, handleSummary }
}
