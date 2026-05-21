// Langfuse Public API reads via the official SDK (langfuse@3).
//
// Strategy (see plan Key Technical Decisions): page traces in the window
// with `orderBy` pinned, then fetch each trace's GENERATION observations
// BY traceId — one window definition, no date-boundary orphaning. Field
// access is intentionally defensive: the live payload shape is unverified
// (plan Open Questions), so we read through narrow local views and never
// assume a field is present.

import { Langfuse } from 'langfuse'

import type { ToolEnv } from '../env'
import type { DateWindow, ObservationRecord, TraceRecord } from '../types'

export interface FetchOptions {
  // Delay between API calls. Default keeps us under the ~100 req/min
  // Hobby-tier ceiling (60000 / 100 = 600ms floor).
  throttleMs?: number
  pageSize?: number
  // Called with progress messages so the CLI can show what's happening.
  onProgress?: (message: string) => void
}

const DEFAULT_THROTTLE_MS = 700
const DEFAULT_PAGE_SIZE = 100
// Hard ceiling so a pathological `meta.totalPages` (huge / Infinity / NaN)
// can't drive an unbounded fetch+sleep loop.
const MAX_PAGES = 10000

function clampTotalPages(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) return 1
  return Math.min(Math.floor(value), MAX_PAGES)
}

// Narrow views of the SDK response items — only the fields we read.
interface RawTrace {
  id?: string
  sessionId?: string | null
  timestamp?: string | Date | null
  metadata?: unknown
  tags?: unknown
}

interface RawObservation {
  id?: string
  traceId?: string | null
  type?: string | null
  model?: string | null
  startTime?: string | Date | null
  endTime?: string | Date | null
  latency?: number | null
  input?: unknown
  output?: unknown
  usage?: unknown
  usageDetails?: unknown
  calculatedTotalCost?: number | null
  totalCost?: number | null
}

const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms))

export function createLangfuseClient(env: ToolEnv): Langfuse {
  return new Langfuse({
    publicKey: env.langfusePublicKey,
    secretKey: env.langfuseSecretKey,
    baseUrl: env.langfuseBaseUrl
  })
}

function toIso(value: string | Date | null | undefined): string {
  if (value == null) return ''
  return value instanceof Date ? value.toISOString() : String(value)
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
  return typeof value === 'string' && value.length > 0 ? value : undefined
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
    metadata,
    tags: asStringArray(raw.tags),
    ipCountry: metaString(metadata, 'ipCountry'),
    journeyId: metaString(metadata, 'journeyId'),
    language: metaString(metadata, 'language')
  }
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function mapObservation(raw: RawObservation): ObservationRecord {
  // Langfuse usage fields are input / output / total (confirmed against the
  // observations export). usageDetails is preferred; usage is the fallback.
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

// Page all traces in the window, oldest first.
export async function fetchAllTraces(
  client: Langfuse,
  window: DateWindow,
  options: FetchOptions = {}
): Promise<TraceRecord[]> {
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const traces: TraceRecord[] = []
  let page = 1
  let totalPages = 1

  do {
    const response = await client.fetchTraces({
      fromTimestamp: window.from,
      toTimestamp: window.to,
      orderBy: 'timestamp.asc',
      limit: pageSize,
      page
    } as Parameters<Langfuse['fetchTraces']>[0])

    const data = (response.data ?? []) as RawTrace[]
    for (const raw of data) traces.push(mapTrace(raw))

    totalPages = clampTotalPages(response.meta?.totalPages)
    options.onProgress?.(`traces: page ${page}/${totalPages} (${traces.length} so far)`)
    if (data.length === 0) break
    page += 1
    if (page <= totalPages) await sleep(throttleMs)
  } while (page <= totalPages)

  return traces
}

// Fetch GENERATION observations for a single trace (by traceId), paginating
// if a trace ever has more than one page of generations.
async function fetchGenerationsForTrace(
  client: Langfuse,
  traceId: string,
  pageSize: number,
  throttleMs: number
): Promise<ObservationRecord[]> {
  const observations: ObservationRecord[] = []
  let page = 1
  let totalPages = 1

  do {
    const response = await client.fetchObservations({
      traceId,
      type: 'GENERATION',
      limit: pageSize,
      page
    } as Parameters<Langfuse['fetchObservations']>[0])

    const data = (response.data ?? []) as RawObservation[]
    for (const raw of data) observations.push(mapObservation(raw))

    totalPages = clampTotalPages(response.meta?.totalPages)
    if (data.length === 0) break
    page += 1
    if (page <= totalPages) await sleep(throttleMs)
  } while (page <= totalPages)

  return observations
}

// Fetch generations for every trace, by traceId, throttled.
export async function fetchObservationsForTraces(
  client: Langfuse,
  traceIds: string[],
  options: FetchOptions = {}
): Promise<ObservationRecord[]> {
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const all: ObservationRecord[] = []

  for (let index = 0; index < traceIds.length; index += 1) {
    const traceId = traceIds[index]
    const generations = await fetchGenerationsForTrace(
      client,
      traceId,
      pageSize,
      throttleMs
    )
    all.push(...generations)
    options.onProgress?.(
      `observations: trace ${index + 1}/${traceIds.length} (${all.length} generations)`
    )
    if (index < traceIds.length - 1) await sleep(throttleMs)
  }

  return all
}

export interface TraceData {
  traces: TraceRecord[]
  observations: ObservationRecord[]
}

// One call the CLI uses: traces in window, then their generations by traceId.
export async function fetchTraceData(
  client: Langfuse,
  window: DateWindow,
  options: FetchOptions = {}
): Promise<TraceData> {
  const traces = await fetchAllTraces(client, window, options)
  const observations = await fetchObservationsForTraces(
    client,
    traces.map((trace) => trace.id),
    options
  )
  return { traces, observations }
}
