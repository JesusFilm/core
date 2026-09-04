export type BackfillProvider = 'mux' | 'r2' | 'legacy'

export type BackfillOutcome =
  | 'repairable'
  | 'applied'
  | 'alreadyCorrected'
  | 'skipped'
  | 'failed'

export type BackfillErrorCode =
  | 'noRenditionMatch'
  | 'httpUnreachable'
  | 'invalidLength'
  | 'sizeConflict'
  | 'missingAsset'
  | 'writeConflict'
  | 'unknown'

export type BackfillAuditRecord = {
  downloadId: string
  videoVariantId: string | null
  provider: BackfillProvider
  priorSize: number | null
  verifiedSize: number | null
  outcome: BackfillOutcome
  errorCode: BackfillErrorCode | null
}

export type BackfillProviderSummary = {
  totalCandidates: number
  repairable: number
  applied: number
  alreadyCorrected: number
  skipped: number
  failed: number
}

export type BackfillSummary = {
  totalCandidates: number
  repairable: number
  applied: number
  alreadyCorrected: number
  skipped: number
  failed: number
  byProvider: Record<BackfillProvider, BackfillProviderSummary>
}

export type ResolveSizeResult =
  | { size: number; errorCode: null }
  | { size: null; errorCode: BackfillErrorCode }

export type HttpHeadersResult = {
  ok: boolean
  status: number
  contentLength: string | null
  contentRangeTotal: number | null
}

export interface HttpSizeClient {
  head: (url: string) => Promise<HttpHeadersResult>
  rangeGet: (url: string) => Promise<HttpHeadersResult>
}

export type MuxStaticRenditionFile = {
  resolution?: string | null
  filesize?: string | null
  status?: string | null
}

export type MuxAssetLike = {
  static_renditions?: {
    files?: Array<MuxStaticRenditionFile | null> | null
  } | null
}

export interface MuxAssetFetcher {
  getAsset: (muxAssetId: string) => Promise<MuxAssetLike | null>
}

export type DownloadCandidate = {
  id: string
  size: number | null
  url: string
  assetId: string | null
  videoVariantId: string | null
  asset: { contentLength: bigint } | null
  videoVariant: {
    muxVideoId: string | null
    muxVideo: { assetId: string | null } | null
  } | null
}
