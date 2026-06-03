// Langfuse Public API reads via raw fetch (HTTP Basic auth).
//
// The legacy list endpoints (/api/public/traces and /api/public/observations,
// which the langfuse SDK v3 wraps) TIME OUT on Langfuse Cloud even with a date
// filter. So this client takes the working path instead:
//   1. Page the v2 observations index (/api/public/v2/observations, cursor-
//      based) to enumerate the distinct traceIds in the window. Slim + fast.
//   2. GET /api/public/traces/{id} per trace — a by-id read (no list scan) that
//      returns trace context (sessionId, metadata, tags) AND the full nested
//      observations (input/output/usage/cost/model/latency) in one call.
// Neither call scans a list, so neither times out.

import type { ToolEnv } from '../env'
import type { DateWindow, ObservationRecord, TraceRecord } from '../types'

export interface FetchOptions {
  // Delay between API calls. Default keeps us under the ~100 req/min
  // Hobby-tier ceiling (60000 / 100 = 600ms floor).
  throttleMs?: number
  pageSize?: number
  onProgress?: (message: string) => void
  // Restrict to traces tagged with this deployment environment (NES-1688).
  // Sent to the v2 observations index (server-side filter, fewer per-trace
  // fetches — verified honoured) AND re-checked against each trace's own
  // `environment` as the authoritative guard. `undefined` = all environments.
  environment?: string
}

const DEFAULT_THROTTLE_MS = 700
const DEFAULT_PAGE_SIZE = 100
// Hard ceiling so a never-terminating cursor can't loop forever.
const MAX_PAGES = 10000

export interface LangfuseClient {
  baseUrl: string
  authHeader: string
}

// Narrow views of the API payloads — only the fields we read.
interface RawObservation {
  id?: string
  traceId?: string | null
  type?: string | null
  model?: string | null
  startTime?: string | null
  endTime?: string | null
  latency?: number | null
  input?: unknown
  output?: unknown
  usage?: unknown
  usageDetails?: unknown
  calculatedTotalCost?: number | null
  totalCost?: number | null
}

interface RawTrace {
  id?: string
  sessionId?: string | null
  timestamp?: string | null
  environment?: string | null
  metadata?: unknown
  tags?: unknown
  observations?: unknown
}

const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms))

export function createLangfuseClient(env: ToolEnv): LangfuseClient {
  const token = Buffer.from(
    `${env.langfusePublicKey}:${env.langfuseSecretKey}`
  ).toString('base64')
  return {
    baseUrl: env.langfuseBaseUrl.replace(/\/$/, ''),
    authHeader: `Basic ${token}`
  }
}

async function getJson<T>(client: LangfuseClient, path: string): Promise<T> {
  const response = await fetch(`${client.baseUrl}${path}`, {
    headers: {
      Authorization: client.authHeader,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Langfuse ${response.status} on ${path}: ${body.slice(0, 300)}`
    )
  }
  return (await response.json()) as T
}

function toIso(value: string | null | undefined): string {
  return value == null ? '' : String(value)
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function metaString(
  metadata: Record<string, unknown>,
  key: string
): string | undefined {
  const value = metadata[key]
  if (typeof value === 'string') return value.length > 0 ? value : undefined
  // Trace metadata is free-form JSON in Langfuse — coerce finite numbers
  // and booleans to their string form so a non-string value still surfaces
  // in the export instead of being silently dropped at this boundary.
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return String(value)
  return undefined
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function mapTrace(raw: RawTrace): TraceRecord {
  const metadata = asRecord(raw.metadata)
  return {
    id: String(raw.id ?? ''),
    sessionId:
      typeof raw.sessionId === 'string' && raw.sessionId.length > 0
        ? raw.sessionId
        : null,
    timestamp: toIso(raw.timestamp),
    environment:
      typeof raw.environment === 'string' && raw.environment.length > 0
        ? raw.environment
        : null,
    metadata,
    tags: asStringArray(raw.tags),
    ipCountry: metaString(metadata, 'ipCountry'),
    journeyId: metaString(metadata, 'journeyId'),
    language: metaString(metadata, 'language')
  }
}

export function mapObservation(raw: RawObservation): ObservationRecord {
  // Langfuse usage fields are input / output / total. usageDetails is
  // preferred; usage is the fallback (it carries an extra `unit`).
  const usage = asRecord(raw.usageDetails ?? raw.usage)
  return {
    id: String(raw.id ?? ''),
    traceId: String(raw.traceId ?? ''),
    type: String(raw.type ?? ''),
    model: typeof raw.model === 'string' ? raw.model : null,
    startTime: toIso(raw.startTime),
    endTime: raw.endTime == null ? null : toIso(raw.endTime),
    latencySeconds: numberOrNull(raw.latency),
    inputRaw: raw.input,
    outputRaw: raw.output,
    inputTokens: numberOrNull(usage.input),
    outputTokens: numberOrNull(usage.output),
    totalTokens: numberOrNull(usage.total),
    costUsd: numberOrNull(raw.calculatedTotalCost ?? raw.totalCost)
  }
}

// Enumerate distinct traceIds in the window via the cursor-paginated v2 index.
async function listTraceIds(
  client: LangfuseClient,
  window: DateWindow,
  options: FetchOptions
): Promise<string[]> {
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const traceIds = new Set<string>()
  let cursor: string | undefined

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams({
      type: 'GENERATION',
      limit: String(pageSize),
      fromStartTime: window.from.toISOString(),
      toStartTime: window.to.toISOString()
    })
    if (options.environment != null)
      params.set('environment', options.environment)
    if (cursor != null) params.set('cursor', cursor)

    const response = await getJson<{
      data?: Array<{ traceId?: string | null }>
      meta?: { cursor?: string | null }
    }>(client, `/api/public/v2/observations?${params.toString()}`)

    const data = response.data ?? []
    for (const item of data) {
      if (typeof item.traceId === 'string' && item.traceId.length > 0) {
        traceIds.add(item.traceId)
      }
    }
    options.onProgress?.(
      `observations index: page ${page + 1} (${traceIds.size} traces)`
    )

    cursor = response.meta?.cursor ?? undefined
    if (data.length === 0 || cursor == null) break
    await sleep(throttleMs)
  }

  return [...traceIds]
}

// Fetch one trace's context + its full nested GENERATION observations.
async function fetchTrace(
  client: LangfuseClient,
  traceId: string
): Promise<{ trace: TraceRecord; observations: ObservationRecord[] }> {
  const raw = await getJson<RawTrace>(
    client,
    `/api/public/traces/${encodeURIComponent(traceId)}`
  )
  const trace = mapTrace(raw)
  const nested = Array.isArray(raw.observations)
    ? (raw.observations as RawObservation[])
    : []
  const observations = nested
    .filter((observation) => observation.type === 'GENERATION')
    // Pin traceId to the parent in case the nested record omits it.
    .map((observation) => ({
      ...mapObservation(observation),
      traceId: trace.id
    }))
  return { trace, observations }
}

export interface TraceData {
  traces: TraceRecord[]
  observations: ObservationRecord[]
}

// The CLI's one call: v2 index -> distinct traceIds -> per-trace detail.
export async function fetchTraceData(
  client: LangfuseClient,
  window: DateWindow,
  options: FetchOptions = {}
): Promise<TraceData> {
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS
  const traceIds = await listTraceIds(client, window, options)

  const traces: TraceRecord[] = []
  const observations: ObservationRecord[] = []
  for (let index = 0; index < traceIds.length; index += 1) {
    const { trace, observations: obs } = await fetchTrace(
      client,
      traceIds[index]
    )
    // Authoritative guard: the index param is server-side best-effort; re-check
    // the trace's own env. Checked after the fetch so it never skips the throttle.
    if (
      options.environment == null ||
      trace.environment === options.environment
    ) {
      traces.push(trace)
      observations.push(...obs)
    }
    options.onProgress?.(`traces: ${index + 1}/${traceIds.length}`)
    if (index < traceIds.length - 1) await sleep(throttleMs)
  }

  return { traces, observations }
}
