// Read enriched v2 observations; trace records below are a local projection.
import type { ToolEnv } from '../env'
import { extractAssistantReply } from '../pipeline/normalize'
import type { DateWindow, ObservationRecord, TraceRecord } from '../types'

export interface FetchOptions {
  // Delay between API calls. Default keeps us under the ~100 req/min
  // Hobby-tier ceiling (60000 / 100 = 600ms floor).
  throttleMs?: number
  pageSize?: number
  onProgress?: (message: string) => void
  // Restrict to traces tagged with this deployment environment (NES-1688).
  // Filter server-side and re-check each observation. Undefined = all environments.
  environment?: string
}

const DEFAULT_THROTTLE_MS = 700
const DEFAULT_PAGE_SIZE = 100
// Hard ceiling so a never-terminating cursor can't loop forever.
const MAX_PAGES = 10000
// Langfuse Cloud returns transient 502/503/429s under load; without a retry a
// single blip mid-fetch aborts an otherwise-complete extraction (a real run hit
// a 502 on trace 68/94). Retry idempotent GETs a few times with exponential
// backoff before giving up; 4xx (except 429) still fail fast.
const MAX_REQUEST_RETRIES = 4
const RETRY_BASE_MS = 800

export interface LangfuseClient {
  baseUrl: string
  authHeader: string
}

// Narrow views of the API payloads — only the fields we read.
interface RawObservation {
  parentObservationId?: string | null
  isRootObservation?: boolean
  sessionId?: string | null
  environment?: string | null
  metadata?: unknown
  tags?: unknown
  inputUsage?: number | null
  outputUsage?: number | null
  totalUsage?: number | null
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

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500
}

async function getJson<T>(client: LangfuseClient, path: string): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    let response: Response | undefined
    let networkError: unknown
    try {
      response = await fetch(`${client.baseUrl}${path}`, {
        headers: {
          Authorization: client.authHeader,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      // fetch rejects on DNS/connection/timeout failures — also transient.
      networkError = error
    }

    if (response != null && response.ok) {
      return (await response.json()) as T
    }

    const retryable =
      networkError != null ||
      (response != null && isRetryableStatus(response.status))
    if (retryable && attempt < MAX_REQUEST_RETRIES) {
      await sleep(RETRY_BASE_MS * 2 ** attempt)
      continue
    }

    if (networkError != null) throw networkError
    const failed = response as Response
    const body = await failed.text()
    throw new Error(
      `Langfuse ${failed.status} on ${path}: ${body.slice(0, 300)}`
    )
  }
}

function toIso(value: string | null | undefined): string {
  return value == null ? '' : String(value)
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try {
    const parsed: unknown = JSON.parse(value)
    // Preserve plain replies such as "42" and "true" as text.
    return typeof parsed === 'string' ||
      (parsed != null && typeof parsed === 'object')
      ? parsed
      : value
  } catch {
    return value
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  value = parseJson(value)
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

function parseOutput(value: unknown): unknown {
  const parsed = parseJson(value)
  // A literal JSON answer is still assistant text. Decode known message
  // shapes, but never turn an unsupported object/array into an empty reply.
  if (typeof parsed === 'string') return parsed
  if (typeof value === 'string' && extractAssistantReply(parsed) === '')
    return value
  return parsed
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
    inputRaw: parseJson(raw.input),
    outputRaw: parseOutput(raw.output),
    inputTokens: numberOrNull(raw.inputUsage ?? usage.input),
    outputTokens: numberOrNull(raw.outputUsage ?? usage.output),
    totalTokens: numberOrNull(raw.totalUsage ?? usage.total),
    costUsd: numberOrNull(raw.calculatedTotalCost ?? raw.totalCost)
  }
}

export interface TraceData {
  traces: TraceRecord[]
  observations: ObservationRecord[]
}

// Both discovery and per-trace detail use the supported cursor-paginated API.
async function listObservations(
  client: LangfuseClient,
  query: Record<string, string>,
  options: FetchOptions
): Promise<RawObservation[]> {
  const rows = new Map<string, RawObservation>()
  const seenCursors = new Set<string>()
  let cursor: string | undefined
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams({
      ...query,
      limit: String(options.pageSize ?? DEFAULT_PAGE_SIZE)
    })
    if (cursor != null) params.set('cursor', cursor)
    const response = await getJson<{
      data: RawObservation[]
      meta?: { cursor?: string | null }
    }>(client, `/api/public/v2/observations?${params.toString()}`)
    if (!Array.isArray(response.data)) {
      throw new Error('Langfuse observations response is missing data')
    }
    for (const raw of response.data) {
      if (raw.id) rows.set(raw.id, raw)
    }
    options.onProgress?.(`observations: page ${page + 1} (${rows.size} rows)`)
    cursor = response.meta?.cursor ?? undefined
    if (cursor == null) return [...rows.values()]
    if (seenCursors.has(cursor)) {
      throw new Error('Langfuse observations pagination repeated a cursor')
    }
    seenCursors.add(cursor)
    await sleep(options.throttleMs ?? DEFAULT_THROTTLE_MS)
  }
  throw new Error(`Langfuse observations exceeded ${MAX_PAGES} pages`)
}

function traceContext(traceId: string, rows: RawObservation[]): TraceRecord {
  const ordered = [...rows].sort((a, b) =>
    toIso(a.startTime).localeCompare(toIso(b.startTime))
  )
  const roots = ordered.filter(
    (row) =>
      row.isRootObservation === true ||
      row.parentObservationId === null ||
      row.parentObservationId === ''
  )
  // A recovered root is authoritative even when its metadata is empty: that
  // is known untagged history, not a failed recovery. Rootless current Core
  // traces can use the context copied consistently to their generations.
  const generations = ordered.filter((row) => row.type === 'GENERATION')
  const generationContext = generations[0]
  const contextKeys = [
    'journeyId',
    'ipCountry',
    'language',
    'provider',
    'modelId'
  ]
  const consistentGenerationContext =
    generationContext != null &&
    metaString(asRecord(generationContext.metadata), 'journeyId') != null &&
    generations.every(
      (row) =>
        contextKeys.every(
          (key) =>
            asRecord(row.metadata)[key] ===
            asRecord(generationContext.metadata)[key]
        ) &&
        row.sessionId === generationContext.sessionId &&
        row.environment === generationContext.environment &&
        JSON.stringify(asStringArray(row.tags).sort()) ===
          JSON.stringify(asStringArray(generationContext.tags).sort())
    )
  const context =
    roots[0] ?? (consistentGenerationContext ? generationContext : undefined)
  if (context == null) {
    // Legacy children can lose trace metadata during migration. Refuse an
    // unattributed export or silently bypassed journey/tag exclusion; an
    // existing fixture/snapshot remains usable without deprecated API reads.
    throw new Error(
      `Langfuse trace ${traceId} has no recoverable root or consistent generation context in v2 observations; legacy trace metadata may not have been migrated. Export stopped to avoid incorrect attribution or load-test filtering.`
    )
  }
  return mapTrace({
    ...context,
    id: traceId,
    timestamp: roots[0]?.startTime ?? ordered[0]?.startTime
  })
}

// Preserve the old contract: a window selects trace IDs, then ALL generations
// of each selected trace are exported, including turns outside that window.
export async function fetchTraceData(
  client: LangfuseClient,
  window: DateWindow,
  options: FetchOptions = {}
): Promise<TraceData> {
  const index = await listObservations(
    client,
    {
      type: 'GENERATION',
      fields: 'core,basic',
      fromStartTime: window.from.toISOString(),
      toStartTime: window.to.toISOString(),
      ...(options.environment != null && { environment: options.environment })
    },
    options
  )
  const traceIds = new Set(
    index
      .filter(
        (row) =>
          row.type === 'GENERATION' &&
          row.traceId &&
          (options.environment == null ||
            row.environment === options.environment)
      )
      .map((row) => row.traceId!)
  )
  const traces: TraceRecord[] = []
  const observations: ObservationRecord[] = []
  for (const traceId of traceIds) {
    await sleep(options.throttleMs ?? DEFAULT_THROTTLE_MS)
    // Exact traceId bounds this lookup. Do not reapply discovery times or type:
    // earlier/later generations and a separate root must remain available.
    const rows = (
      await listObservations(
        client,
        {
          traceId,
          fields: 'core,basic,io,metadata,model,usage,metrics,trace_context',
          expandMetadata: 'journeyId,ipCountry,language,provider,modelId'
        },
        options
      )
    ).filter((row) => row.traceId === traceId)
    const context = traceContext(traceId, rows)
    if (
      options.environment != null &&
      context.environment !== options.environment
    )
      continue
    traces.push(context)
    observations.push(
      ...rows.filter((row) => row.type === 'GENERATION').map(mapObservation)
    )
  }
  return { traces, observations }
}
