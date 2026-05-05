import { prisma } from '@core/prisma/media/client'

import {
  getAlgoliaClient,
  getAlgoliaConfig
} from '../../lib/algolia/algoliaClient'
import { logger } from '../../logger'
import { builder } from '../builder'
import {
  AlgoliaVideoMismatch,
  PRIMARY_VARIANT_LANGUAGE_ID,
  buildExpectedAlgoliaVideo,
  diffAlgoliaVideo
} from '../video/videoAlgolia/compareVideoToAlgolia'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

function clampLimit(limit: number | null | undefined): number {
  if (limit == null) return DEFAULT_LIMIT
  if (limit < 1) return 1
  if (limit > MAX_LIMIT) return MAX_LIMIT
  return limit
}

function clampOffset(offset: number | null | undefined): number {
  if (offset == null || offset < 0) return 0
  return offset
}

const AlgoliaDriftKind = builder.enumType('AlgoliaDriftKind', {
  values: ['missing_in_algolia', 'missing_in_db', 'mismatch'] as const
})

type AlgoliaDriftKindValue =
  | 'missing_in_algolia'
  | 'missing_in_db'
  | 'mismatch'

const UploadStage = builder.enumType('UploadStage', {
  values: ['no_mux', 'mux_not_ready', 'no_variant'] as const
})

type UploadStageValue = 'no_mux' | 'mux_not_ready' | 'no_variant'

type AvailableLanguagesIssue = {
  videoId: string
  videoTitle: string | null
  expected: string[]
  actual: string[]
  missing: string[]
  extra: string[]
}

const AvailableLanguagesIssueRef = builder
  .objectRef<AvailableLanguagesIssue>('AvailableLanguagesIssue')
  .implement({
    fields: (t) => ({
      videoId: t.exposeID('videoId'),
      videoTitle: t.exposeString('videoTitle', { nullable: true }),
      expected: t.exposeStringList('expected'),
      actual: t.exposeStringList('actual'),
      missing: t.exposeStringList('missing'),
      extra: t.exposeStringList('extra')
    })
  })

const AlgoliaVideoDriftMismatchRef = builder
  .objectRef<AlgoliaVideoMismatch>('AlgoliaVideoDriftMismatch')
  .implement({
    fields: (t) => ({
      field: t.exposeString('field'),
      expected: t.exposeString('expected', { nullable: true }),
      actual: t.exposeString('actual', { nullable: true })
    })
  })

type AlgoliaVideoDrift = {
  videoId: string
  videoTitle: string | null
  kind: AlgoliaDriftKindValue
  mismatches: AlgoliaVideoMismatch[]
}

const AlgoliaVideoDriftRef = builder
  .objectRef<AlgoliaVideoDrift>('AlgoliaVideoDrift')
  .implement({
    fields: (t) => ({
      videoId: t.exposeID('videoId'),
      videoTitle: t.exposeString('videoTitle', { nullable: true }),
      kind: t.field({ type: AlgoliaDriftKind, resolve: (parent) => parent.kind }),
      mismatches: t.field({
        type: [AlgoliaVideoDriftMismatchRef],
        resolve: (parent) => parent.mismatches
      })
    })
  })

type AlgoliaVariantDrift = {
  variantId: string
  videoId: string | null
  kind: AlgoliaDriftKindValue
}

const AlgoliaVariantDriftRef = builder
  .objectRef<AlgoliaVariantDrift>('AlgoliaVariantDrift')
  .implement({
    fields: (t) => ({
      variantId: t.exposeID('variantId'),
      videoId: t.exposeID('videoId', { nullable: true }),
      kind: t.field({ type: AlgoliaDriftKind, resolve: (parent) => parent.kind })
    })
  })

type UploadStateIssue = {
  r2AssetId: string
  fileName: string
  videoId: string | null
  stage: UploadStageValue
  r2CreatedAt: Date
  muxVideoId: string | null
  muxReadyToStream: boolean | null
}

const UploadStateIssueRef = builder
  .objectRef<UploadStateIssue>('UploadStateIssue')
  .implement({
    fields: (t) => ({
      r2AssetId: t.exposeID('r2AssetId'),
      fileName: t.exposeString('fileName'),
      videoId: t.exposeID('videoId', { nullable: true }),
      stage: t.field({ type: UploadStage, resolve: (parent) => parent.stage }),
      r2CreatedAt: t.field({
        type: 'DateTime',
        resolve: (parent) => parent.r2CreatedAt
      }),
      muxVideoId: t.exposeID('muxVideoId', { nullable: true }),
      muxReadyToStream: t.field({
        type: 'Boolean',
        nullable: true,
        resolve: (parent) => parent.muxReadyToStream
      })
    })
  })

type VideoIssueSummary = {
  availableLanguagesCount: number
  algoliaVideoDriftCount: number
  algoliaVariantDriftCount: number
  uploadStateCount: number
}

const VideoIssueSummaryRef = builder
  .objectRef<VideoIssueSummary>('VideoIssueSummary')
  .implement({
    fields: (t) => ({
      availableLanguagesCount: t.exposeInt('availableLanguagesCount'),
      algoliaVideoDriftCount: t.exposeInt('algoliaVideoDriftCount'),
      algoliaVariantDriftCount: t.exposeInt('algoliaVariantDriftCount'),
      uploadStateCount: t.exposeInt('uploadStateCount')
    })
  })

// availableLanguages check
// One bulk Prisma query, classify each row in JS, filter to mismatches.
export async function computeAvailableLanguagesIssues(): Promise<
  AvailableLanguagesIssue[]
> {
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      availableLanguages: true,
      title: { select: { value: true }, take: 1 },
      variants: {
        where: { published: true },
        select: { languageId: true }
      },
      children: {
        where: { published: true },
        select: { availableLanguages: true }
      }
    }
  })

  const issues: AvailableLanguagesIssue[] = []

  for (const video of videos) {
    const expectedSet = new Set<string>()
    for (const variant of video.variants) {
      expectedSet.add(variant.languageId)
    }
    for (const child of video.children) {
      for (const lang of child.availableLanguages) {
        expectedSet.add(lang)
      }
    }

    const expected = Array.from(expectedSet).sort(
      (a, b) => Number(a) - Number(b)
    )
    const actual = [...video.availableLanguages].sort(
      (a, b) => Number(a) - Number(b)
    )
    const actualSet = new Set(actual)
    const missing = expected.filter((lang) => !actualSet.has(lang))
    const extra = actual.filter((lang) => !expectedSet.has(lang))

    if (missing.length === 0 && extra.length === 0) continue

    issues.push({
      videoId: video.id,
      videoTitle: video.title[0]?.value ?? null,
      expected,
      actual,
      missing,
      extra
    })
  }

  return issues
}

// Algolia video drift check
// One Prisma query + one Algolia browseObjects pass; diff the two sets.
export async function computeAlgoliaVideoDrift(): Promise<AlgoliaVideoDrift[]> {
  const client = getAlgoliaClient()
  const config = getAlgoliaConfig()

  const dbVideos = await prisma.video.findMany({
    select: {
      id: true,
      label: true,
      restrictViewPlatforms: true,
      title: { select: { value: true }, take: 1 },
      keywords: { select: { value: true } },
      variants: {
        select: {
          hls: true,
          lengthInMilliseconds: true,
          downloadable: true
        },
        where: { languageId: PRIMARY_VARIANT_LANGUAGE_ID },
        take: 1
      }
    }
  })
  const dbVideoMap = new Map(dbVideos.map((video) => [video.id, video]))

  const algoliaRecords: Array<Record<string, unknown>> = []
  try {
    await client.browseObjects({
      indexName: config.videosIndex,
      aggregator: (response: { hits: Array<Record<string, unknown>> }) => {
        algoliaRecords.push(...response.hits)
      }
    })
  } catch (err) {
    logger?.error(
      { err, indexName: config.videosIndex },
      'Algolia browseObjects failed during video drift check'
    )
    throw err
  }
  const algoliaMap = new Map(
    algoliaRecords.map((record) => [String(record.objectID), record])
  )

  const issues: AlgoliaVideoDrift[] = []

  for (const video of dbVideos) {
    const record = algoliaMap.get(video.id)
    const videoTitle = video.title[0]?.value ?? null

    if (record == null) {
      issues.push({
        videoId: video.id,
        videoTitle,
        kind: 'missing_in_algolia',
        mismatches: []
      })
      continue
    }

    const expected = buildExpectedAlgoliaVideo(video)
    const mismatches = diffAlgoliaVideo(expected, record)
    if (mismatches.length > 0) {
      issues.push({
        videoId: video.id,
        videoTitle,
        kind: 'mismatch',
        mismatches
      })
    }
  }

  for (const objectID of algoliaMap.keys()) {
    if (dbVideoMap.has(objectID)) continue
    issues.push({
      videoId: objectID,
      videoTitle: null,
      kind: 'missing_in_db',
      mismatches: []
    })
  }

  return issues
}

// Algolia variant drift check
// Both directions: variants in DB but not Algolia, and vice versa.
export async function computeAlgoliaVariantDrift(): Promise<
  AlgoliaVariantDrift[]
> {
  const client = getAlgoliaClient()
  const config = getAlgoliaConfig()

  const dbVariants = await prisma.videoVariant.findMany({
    select: { id: true, videoId: true }
  })
  const dbVariantMap = new Map(
    dbVariants.map((variant) => [variant.id, variant.videoId])
  )

  const algoliaRecords: Array<Record<string, unknown>> = []
  try {
    await client.browseObjects({
      indexName: config.videoVariantsIndex,
      aggregator: (response: { hits: Array<Record<string, unknown>> }) => {
        algoliaRecords.push(...response.hits)
      }
    })
  } catch (err) {
    logger?.error(
      { err, indexName: config.videoVariantsIndex },
      'Algolia browseObjects failed during variant drift check'
    )
    throw err
  }
  const algoliaMap = new Map(
    algoliaRecords.map((record) => [String(record.objectID), record])
  )

  const issues: AlgoliaVariantDrift[] = []

  for (const [variantId, videoId] of dbVariantMap) {
    if (!algoliaMap.has(variantId)) {
      issues.push({
        variantId,
        videoId,
        kind: 'missing_in_algolia'
      })
    }
  }

  for (const [variantId, record] of algoliaMap) {
    if (dbVariantMap.has(variantId)) continue
    const videoIdValue = record.videoId
    issues.push({
      variantId,
      videoId: typeof videoIdValue === 'string' ? videoIdValue : null,
      kind: 'missing_in_db'
    })
  }

  return issues
}

// Upload state check
// Walks every CloudflareR2 attached to a video and classifies its lifecycle
// stage. Excludes subtitle-source assets so we only see primary video uploads.
export async function computeUploadStateIssues(): Promise<UploadStateIssue[]> {
  const r2Assets = await prisma.cloudflareR2.findMany({
    where: {
      videoId: { not: null },
      videoSubtitleSrt: null,
      videoSubtitleVtt: null
    },
    select: {
      id: true,
      fileName: true,
      videoId: true,
      createdAt: true,
      videoVariant: {
        select: {
          muxVideo: {
            select: { id: true, readyToStream: true }
          }
        }
      }
    }
  })

  const issues: UploadStateIssue[] = []

  for (const r2 of r2Assets) {
    const variant = r2.videoVariant

    if (variant == null) {
      issues.push({
        r2AssetId: r2.id,
        fileName: r2.fileName,
        videoId: r2.videoId,
        stage: 'no_variant',
        r2CreatedAt: r2.createdAt,
        muxVideoId: null,
        muxReadyToStream: null
      })
      continue
    }

    const muxVideo = variant.muxVideo
    if (muxVideo == null) {
      issues.push({
        r2AssetId: r2.id,
        fileName: r2.fileName,
        videoId: r2.videoId,
        stage: 'no_mux',
        r2CreatedAt: r2.createdAt,
        muxVideoId: null,
        muxReadyToStream: null
      })
      continue
    }

    if (!muxVideo.readyToStream) {
      issues.push({
        r2AssetId: r2.id,
        fileName: r2.fileName,
        videoId: r2.videoId,
        stage: 'mux_not_ready',
        r2CreatedAt: r2.createdAt,
        muxVideoId: muxVideo.id,
        muxReadyToStream: false
      })
    }
  }

  return issues
}

builder.queryFields((t) => ({
  availableLanguagesIssues: t.withAuth({ isPublisher: true }).field({
    type: [AvailableLanguagesIssueRef],
    nullable: false,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false })
    },
    resolve: async (_parent, args) => {
      const issues = await computeAvailableLanguagesIssues()
      const offset = clampOffset(args.offset)
      const limit = clampLimit(args.limit)
      return issues.slice(offset, offset + limit)
    }
  }),
  algoliaVideoDrift: t.withAuth({ isPublisher: true }).field({
    type: [AlgoliaVideoDriftRef],
    nullable: false,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false })
    },
    resolve: async (_parent, args) => {
      const issues = await computeAlgoliaVideoDrift()
      const offset = clampOffset(args.offset)
      const limit = clampLimit(args.limit)
      return issues.slice(offset, offset + limit)
    }
  }),
  algoliaVariantDrift: t.withAuth({ isPublisher: true }).field({
    type: [AlgoliaVariantDriftRef],
    nullable: false,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false })
    },
    resolve: async (_parent, args) => {
      const issues = await computeAlgoliaVariantDrift()
      const offset = clampOffset(args.offset)
      const limit = clampLimit(args.limit)
      return issues.slice(offset, offset + limit)
    }
  }),
  uploadStateIssues: t.withAuth({ isPublisher: true }).field({
    type: [UploadStateIssueRef],
    nullable: false,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false })
    },
    resolve: async (_parent, args) => {
      const issues = await computeUploadStateIssues()
      const offset = clampOffset(args.offset)
      const limit = clampLimit(args.limit)
      return issues.slice(offset, offset + limit)
    }
  }),
  videoIssueSummary: t.withAuth({ isPublisher: true }).field({
    type: VideoIssueSummaryRef,
    nullable: false,
    resolve: async () => {
      const [
        availableLanguagesIssues,
        algoliaVideoDrift,
        algoliaVariantDrift,
        uploadStateIssues
      ] = await Promise.all([
        computeAvailableLanguagesIssues(),
        computeAlgoliaVideoDrift(),
        computeAlgoliaVariantDrift(),
        computeUploadStateIssues()
      ])

      return {
        availableLanguagesCount: availableLanguagesIssues.length,
        algoliaVideoDriftCount: algoliaVideoDrift.length,
        algoliaVariantDriftCount: algoliaVariantDrift.length,
        uploadStateCount: uploadStateIssues.length
      }
    }
  })
}))
