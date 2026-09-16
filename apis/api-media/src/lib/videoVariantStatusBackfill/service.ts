import { Prisma, prisma } from '@core/prisma/media/client'

import { logger } from '../../logger'

import { classifyVideoVariant } from './classifyStages'
import type {
  ParentVideoForClassification,
  ProcessingStages,
  VideoForClassification,
  VideoVariantForClassification,
  VideoVariantProcessingStatus
} from './types'

const DEFAULT_BATCH_SIZE = 500

/**
 * Rejects an invalid batch size before it can reach the Prisma query -- a
 * zero, negative, non-finite, or unsafe value would make `take: batchSize`
 * return no rows while `hasMore` stays true forever, looping without ever
 * advancing the cursor.
 */
export function assertValidBatchSize(batchSize: number | undefined): number {
  if (batchSize == null) return DEFAULT_BATCH_SIZE
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
    throw new Error(
      `Invalid batchSize: ${batchSize}. Expected a finite positive safe integer.`
    )
  }
  return batchSize
}

export type VideoVariantStatusBackfillAction =
  | 'skipAlreadyCanonical'
  | 'promoteExistingUpload'
  | 'createSyntheticCanonical'
  | 'failed'

export type VideoVariantStatusBackfillRecord = {
  videoVariantId: string
  action: VideoVariantStatusBackfillAction
  applied: boolean
  processingStatus: VideoVariantProcessingStatus | null
  canonicalSource: 'upload' | 'backfill' | null
  uploadId: string | null
  error?: string
}

export type VideoVariantStatusBackfillSummary = {
  totalCandidates: number
  applied: number
  skipAlreadyCanonical: number
  promoteExistingUpload: number
  createSyntheticCanonical: number
  failed: number
}

export function emptyBackfillSummary(): VideoVariantStatusBackfillSummary {
  return {
    totalCandidates: 0,
    applied: 0,
    skipAlreadyCanonical: 0,
    promoteExistingUpload: 0,
    createSyntheticCanonical: 0,
    failed: 0
  }
}

export type VideoVariantStatusBackfillOptions = {
  apply: boolean
  batchSize?: number
  startAfterId?: string | null
}

export type VideoVariantStatusBackfillResult = {
  summary: VideoVariantStatusBackfillSummary
  records: VideoVariantStatusBackfillRecord[]
  lastProcessedId: string | null
  hasMore: boolean
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isCanonicalUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    (error.meta?.target as string[] | undefined)?.includes(
      'canonicalVideoVariantId'
    ) === true
  )
}

type VariantRow = VideoVariantForClassification & {
  videoId: string
  edition: string
  version: number
  published: boolean
}

async function backfillVariant({
  variant,
  video,
  parentVideos,
  existingUpload,
  isAlreadyCanonical,
  apply
}: {
  variant: VariantRow
  video: VideoForClassification
  parentVideos: ParentVideoForClassification[]
  existingUpload: { id: string } | undefined
  isAlreadyCanonical: boolean
  apply: boolean
}): Promise<VideoVariantStatusBackfillRecord> {
  if (isAlreadyCanonical) {
    return {
      videoVariantId: variant.id,
      action: 'skipAlreadyCanonical',
      applied: false,
      processingStatus: null,
      canonicalSource: null,
      uploadId: null
    }
  }

  const classification = classifyVideoVariant(variant, video, parentVideos)
  const canonicalSource: 'upload' | 'backfill' =
    existingUpload != null ? 'upload' : 'backfill'
  const action: VideoVariantStatusBackfillAction =
    existingUpload != null
      ? 'promoteExistingUpload'
      : 'createSyntheticCanonical'

  if (!apply) {
    return {
      videoVariantId: variant.id,
      action,
      applied: false,
      processingStatus: classification.processingStatus,
      canonicalSource,
      uploadId: existingUpload?.id ?? null
    }
  }

  try {
    if (existingUpload != null) {
      await prisma.videoVariantUpload.update({
        where: { id: existingUpload.id },
        data: {
          canonicalVideoVariantId: variant.id,
          canonicalSource: 'upload',
          processingStatus: classification.processingStatus,
          processingStages:
            classification.stages
        }
      })
      return {
        videoVariantId: variant.id,
        action,
        applied: true,
        processingStatus: classification.processingStatus,
        canonicalSource,
        uploadId: existingUpload.id
      }
    }

    const created = await prisma.videoVariantUpload.create({
      data: {
        source: 'backfill',
        status: classification.hasUsableMedia ? 'variantCreated' : 'failed',
        videoId: variant.videoId,
        edition: variant.edition,
        languageId: variant.languageId,
        version: variant.version,
        published: variant.published,
        videoVariantId: variant.id,
        canonicalVideoVariantId: variant.id,
        canonicalSource: 'backfill',
        processingStatus: classification.processingStatus,
        processingStages:
          classification.stages
      }
    })
    return {
      videoVariantId: variant.id,
      action,
      applied: true,
      processingStatus: classification.processingStatus,
      canonicalSource,
      uploadId: created.id
    }
  } catch (error) {
    // A unique-constraint hit here means another run already made this
    // Variant canonical between the lookup and this write -- converge
    // instead of reporting a spurious failure.
    if (isCanonicalUniqueConstraintViolation(error)) {
      return {
        videoVariantId: variant.id,
        action: 'skipAlreadyCanonical',
        applied: false,
        processingStatus: null,
        canonicalSource: null,
        uploadId: null
      }
    }
    logger.error(
      { error, videoVariantId: variant.id },
      'Video variant status backfill write failed'
    )
    return {
      videoVariantId: variant.id,
      action: 'failed',
      applied: false,
      processingStatus: null,
      canonicalSource: null,
      uploadId: null,
      error: errorMessage(error)
    }
  }
}

function accumulate(
  summary: VideoVariantStatusBackfillSummary,
  record: VideoVariantStatusBackfillRecord
): void {
  summary.totalCandidates++
  summary[record.action]++
  if (record.applied) summary.applied++
}

/**
 * Gives every existing VideoVariant exactly one canonical VideoVariantUpload
 * status record. Where a Variant already has an unambiguous successful
 * ('variantCreated') Upload attempt, that row is promoted to canonical in
 * place. Otherwise a synthetic canonical row is created with a `backfill`
 * source. Existing Upload rows are never overwritten beyond adding the
 * canonical/processing fields to the one promoted row -- all other attempt
 * history is untouched.
 *
 * Idempotent: a Variant that already has a canonical row (from a prior run,
 * or eventually from the live upload path) is skipped entirely. Defaults to
 * dry-run (apply: false). Processes one bounded, resumable batch per call --
 * pass the previous result's lastProcessedId back in as startAfterId to
 * continue.
 */
export async function runVideoVariantStatusBackfill(
  options: VideoVariantStatusBackfillOptions
): Promise<VideoVariantStatusBackfillResult> {
  const batchSize = assertValidBatchSize(options.batchSize)

  const variants = await prisma.videoVariant.findMany({
    orderBy: { id: 'asc' },
    ...(options.startAfterId != null
      ? { cursor: { id: options.startAfterId }, skip: 1 }
      : {}),
    take: batchSize,
    select: {
      id: true,
      videoId: true,
      languageId: true,
      edition: true,
      version: true,
      published: true,
      hls: true,
      dash: true,
      share: true,
      masterUrl: true,
      duration: true,
      muxVideoId: true,
      assetId: true,
      brightcoveId: true,
      downloadable: true,
      downloads: { select: { id: true } },
      muxVideo: { select: { readyToStream: true } },
      video: { select: { id: true, childIds: true, availableLanguages: true } }
    }
  })

  const summary = emptyBackfillSummary()
  const records: VideoVariantStatusBackfillRecord[] = []

  if (variants.length === 0) {
    return {
      summary,
      records,
      lastProcessedId: options.startAfterId ?? null,
      hasMore: false
    }
  }

  const variantIds = variants.map((variant) => variant.id)
  const videoIds = [...new Set(variants.map((variant) => variant.videoId))]

  const [canonicalRows, successfulUploads, parentVideoRows] = await Promise.all(
    [
      prisma.videoVariantUpload.findMany({
        where: { canonicalVideoVariantId: { in: variantIds } },
        select: { canonicalVideoVariantId: true }
      }),
      prisma.videoVariantUpload.findMany({
        where: { videoVariantId: { in: variantIds }, status: 'variantCreated' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { id: true, videoVariantId: true }
      }),
      prisma.video.findMany({
        where: { childIds: { hasSome: videoIds } },
        select: { id: true, availableLanguages: true, childIds: true }
      })
    ]
  )

  const alreadyCanonicalVariantIds = new Set(
    canonicalRows
      .map((row) => row.canonicalVideoVariantId)
      .filter((id): id is string => id != null)
  )

  const latestSuccessfulUploadByVariantId = new Map<string, { id: string }>()
  for (const upload of successfulUploads) {
    if (upload.videoVariantId == null) continue
    if (!latestSuccessfulUploadByVariantId.has(upload.videoVariantId)) {
      latestSuccessfulUploadByVariantId.set(upload.videoVariantId, {
        id: upload.id
      })
    }
  }

  const parentVideosByVideoId = new Map<
    string,
    ParentVideoForClassification[]
  >()
  for (const videoId of videoIds) {
    parentVideosByVideoId.set(
      videoId,
      parentVideoRows
        .filter((parent) => parent.childIds.includes(videoId))
        .map((parent) => ({
          id: parent.id,
          availableLanguages: parent.availableLanguages
        }))
    )
  }

  for (const variant of variants) {
    if (variant.video == null) {
      const record: VideoVariantStatusBackfillRecord = {
        videoVariantId: variant.id,
        action: 'failed',
        applied: false,
        processingStatus: null,
        canonicalSource: null,
        uploadId: null,
        error: 'Variant has no associated Video'
      }
      records.push(record)
      accumulate(summary, record)
      continue
    }

    const record = await backfillVariant({
      variant: {
        ...variant,
        muxVideoReadyToStream: variant.muxVideo?.readyToStream ?? null
      },
      video: variant.video,
      parentVideos: parentVideosByVideoId.get(variant.videoId) ?? [],
      existingUpload: latestSuccessfulUploadByVariantId.get(variant.id),
      isAlreadyCanonical: alreadyCanonicalVariantIds.has(variant.id),
      apply: options.apply
    })
    records.push(record)
    accumulate(summary, record)
  }

  const lastProcessedId = variants.at(-1)?.id ?? options.startAfterId ?? null
  const hasMore = variants.length === batchSize

  return { summary, records, lastProcessedId, hasMore }
}

export type { ProcessingStages }
