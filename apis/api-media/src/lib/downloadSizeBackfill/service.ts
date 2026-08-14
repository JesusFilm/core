import { Prisma, prisma } from '@core/prisma/media/client'

import { getVideo } from '../../schema/mux/video/service'

import { MUX_STREAM_BASE_URL, classifyProvider } from './classifyProvider'
import { createConcurrencyLimiter } from './concurrencyLimiter'
import { createFetchHttpSizeClient } from './httpSize'
import { resolveLegacySize } from './resolveLegacySize'
import { resolveMuxSize } from './resolveMuxSize'
import { resolveR2Size } from './resolveR2Size'
import type {
  BackfillAuditRecord,
  BackfillProvider,
  BackfillSummary,
  DownloadCandidate,
  HttpSizeClient,
  MuxAssetFetcher,
  MuxAssetLike,
  ResolveSizeResult
} from './types'

export type DownloadSizeBackfillFilters = {
  downloadId?: string
  videoVariantId?: string
  provider?: BackfillProvider
}

export type DownloadSizeBackfillOptions = {
  apply: boolean
  batchSize?: number
  startAfterId?: string | null
  filters?: DownloadSizeBackfillFilters
  muxConcurrency?: number
  r2Concurrency?: number
  legacyConcurrency?: number
  httpClient?: HttpSizeClient
  muxAssetFetcher?: MuxAssetFetcher
  onRecord?: (record: BackfillAuditRecord) => void
}

export type DownloadSizeBackfillResult = {
  summary: BackfillSummary
  records: BackfillAuditRecord[]
  lastProcessedId: string | null
  hasMore: boolean
}

const DEFAULT_BATCH_SIZE = 500
const DEFAULT_MUX_CONCURRENCY = 3
const DEFAULT_R2_CONCURRENCY = 10
const DEFAULT_LEGACY_CONCURRENCY = 3

/**
 * Rejects an invalid batch size before it can reach the Prisma query. A
 * zero, negative, non-finite, fractional, or unsafe value would make
 * `take: batchSize` return no rows while `hasMore` stays true forever,
 * looping without ever advancing the cursor.
 */
export function assertValidBatchSize(
  batchSize: number | undefined
): number {
  if (batchSize == null) return DEFAULT_BATCH_SIZE
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
    throw new Error(
      `Invalid batchSize: ${batchSize}. Expected a finite positive safe integer.`
    )
  }
  return batchSize
}

function createDefaultMuxAssetFetcher(): MuxAssetFetcher {
  return {
    async getAsset(muxAssetId) {
      try {
        return (await getVideo(muxAssetId, false)) as unknown as MuxAssetLike
      } catch {
        return null
      }
    }
  }
}

function emptyProviderSummary(): BackfillSummary['byProvider']['mux'] {
  return {
    totalCandidates: 0,
    repairable: 0,
    applied: 0,
    alreadyCorrected: 0,
    skipped: 0,
    failed: 0
  }
}

function emptySummary(): BackfillSummary {
  return {
    totalCandidates: 0,
    repairable: 0,
    applied: 0,
    alreadyCorrected: 0,
    skipped: 0,
    failed: 0,
    byProvider: {
      mux: emptyProviderSummary(),
      r2: emptyProviderSummary(),
      legacy: emptyProviderSummary()
    }
  }
}

function accumulate(
  summary: BackfillSummary,
  record: BackfillAuditRecord
): void {
  summary.totalCandidates++
  summary[record.outcome]++

  const providerSummary = summary.byProvider[record.provider]
  providerSummary.totalCandidates++
  providerSummary[record.outcome]++
}

function buildProviderWhere(
  provider: BackfillProvider | undefined
): Prisma.VideoVariantDownloadWhereInput | undefined {
  const notMux = { url: { not: { startsWith: MUX_STREAM_BASE_URL } } }
  switch (provider) {
    case 'mux':
      return { url: { startsWith: MUX_STREAM_BASE_URL } }
    case 'r2':
      return { AND: [notMux, { assetId: { not: null } }] }
    case 'legacy':
      return { AND: [notMux, { assetId: null }] }
    default:
      return undefined
  }
}

type ProviderResolutionContext = {
  httpClient: HttpSizeClient
  muxAssetFetcher: MuxAssetFetcher
  muxAssetCache: Map<string, Promise<MuxAssetLike | null>>
}

async function resolveForProvider(
  candidate: DownloadCandidate,
  provider: BackfillProvider,
  ctx: ProviderResolutionContext
): Promise<ResolveSizeResult> {
  if (provider === 'mux') {
    const muxAssetId = candidate.videoVariant?.muxVideo?.assetId ?? null
    let muxAsset: MuxAssetLike | null = null
    if (muxAssetId != null) {
      let pending = ctx.muxAssetCache.get(muxAssetId)
      if (pending == null) {
        pending = ctx.muxAssetFetcher.getAsset(muxAssetId)
        ctx.muxAssetCache.set(muxAssetId, pending)
      }
      muxAsset = await pending
    }
    return resolveMuxSize(candidate.url, muxAsset, ctx.httpClient)
  }

  if (provider === 'r2') {
    return resolveR2Size(candidate.asset)
  }

  return resolveLegacySize(candidate.url, ctx.httpClient)
}

async function processCandidate(
  candidate: DownloadCandidate,
  provider: BackfillProvider,
  apply: boolean,
  ctx: ProviderResolutionContext
): Promise<BackfillAuditRecord> {
  const base = {
    downloadId: candidate.id,
    videoVariantId: candidate.videoVariantId,
    provider,
    priorSize: candidate.size
  }

  let resolved: ResolveSizeResult
  try {
    resolved = await resolveForProvider(candidate, provider, ctx)
  } catch {
    return {
      ...base,
      verifiedSize: null,
      outcome: 'failed',
      errorCode: 'unknown'
    }
  }

  if (resolved.size == null) {
    return {
      ...base,
      verifiedSize: null,
      outcome: 'skipped',
      errorCode: resolved.errorCode
    }
  }

  if (!apply) {
    return {
      ...base,
      verifiedSize: resolved.size,
      outcome: 'repairable',
      errorCode: null
    }
  }

  try {
    // Conditional, size-only write: only rows still null/nonpositive at
    // write time are touched, so a concurrent correction is never
    // overwritten. URL, quality, provider, and asset links are untouched.
    const updateResult = await prisma.videoVariantDownload.updateMany({
      where: {
        id: candidate.id,
        OR: [{ size: null }, { size: { lte: 0 } }]
      },
      data: { size: resolved.size }
    })

    if (updateResult.count === 0) {
      return {
        ...base,
        verifiedSize: resolved.size,
        outcome: 'alreadyCorrected',
        errorCode: null
      }
    }

    return {
      ...base,
      verifiedSize: resolved.size,
      outcome: 'applied',
      errorCode: null
    }
  } catch {
    return {
      ...base,
      verifiedSize: resolved.size,
      outcome: 'failed',
      errorCode: 'unknown'
    }
  }
}

/**
 * Finds every Download with a null or nonpositive size, resolves an
 * authoritative byte length per provider, and conditionally repairs it.
 * Defaults to dry-run (apply: false). Processes one bounded, resumable
 * batch per call — pass the previous result's lastProcessedId back in as
 * startAfterId to continue. A single row's failure never aborts the batch.
 */
export async function runDownloadSizeBackfill(
  options: DownloadSizeBackfillOptions
): Promise<DownloadSizeBackfillResult> {
  const batchSize = assertValidBatchSize(options.batchSize)
  const httpClient = options.httpClient ?? createFetchHttpSizeClient()
  const muxAssetFetcher =
    options.muxAssetFetcher ?? createDefaultMuxAssetFetcher()
  const muxLimit = createConcurrencyLimiter(
    options.muxConcurrency ?? DEFAULT_MUX_CONCURRENCY
  )
  const r2Limit = createConcurrencyLimiter(
    options.r2Concurrency ?? DEFAULT_R2_CONCURRENCY
  )
  const legacyLimit = createConcurrencyLimiter(
    options.legacyConcurrency ?? DEFAULT_LEGACY_CONCURRENCY
  )

  const filters = options.filters ?? {}
  const providerWhere = buildProviderWhere(filters.provider)

  const where: Prisma.VideoVariantDownloadWhereInput = {
    OR: [{ size: null }, { size: { lte: 0 } }],
    ...(filters.downloadId != null ? { id: filters.downloadId } : {}),
    ...(filters.videoVariantId != null
      ? { videoVariantId: filters.videoVariantId }
      : {}),
    ...(providerWhere ?? {})
  }

  const candidates = (await prisma.videoVariantDownload.findMany({
    where,
    orderBy: { id: 'asc' },
    ...(options.startAfterId != null
      ? { cursor: { id: options.startAfterId }, skip: 1 }
      : {}),
    take: batchSize,
    select: {
      id: true,
      size: true,
      url: true,
      assetId: true,
      videoVariantId: true,
      asset: { select: { contentLength: true } },
      videoVariant: {
        select: {
          muxVideoId: true,
          muxVideo: { select: { assetId: true } }
        }
      }
    }
  })) as unknown as DownloadCandidate[]

  const summary = emptySummary()
  const records: BackfillAuditRecord[] = []
  const muxAssetCache = new Map<string, Promise<MuxAssetLike | null>>()

  await Promise.all(
    candidates.map((candidate) => {
      const provider = classifyProvider(candidate)
      const limiter =
        provider === 'mux'
          ? muxLimit
          : provider === 'r2'
            ? r2Limit
            : legacyLimit

      return limiter(async () => {
        const record = await processCandidate(
          candidate,
          provider,
          options.apply,
          { httpClient, muxAssetFetcher, muxAssetCache }
        )
        records.push(record)
        accumulate(summary, record)
        options.onRecord?.(record)
      })
    })
  )

  const lastProcessedId = candidates.at(-1)?.id ?? options.startAfterId ?? null
  const hasMore = candidates.length === batchSize

  return { summary, records, lastProcessedId, hasMore }
}
