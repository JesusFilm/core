import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'

import { PrismaClient } from '.prisma/api-media-client'

import { logger } from '../../logger'
import { createVideoFromUrl, getVideo } from '../../schema/mux/video/service'

const prisma = new PrismaClient()

const DEFAULT_EXPORT_CSV_PATH =
  'apis/api-media/src/scripts/retry-mux-issues.csv'

const GET_LANGUAGE_SLUG = gql`
  query GetLanguageSlug($languageId: ID!) {
    language(id: $languageId) {
      id
      slug
    }
  }
`

interface ProcessVideoUploadJobData {
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string
  metadata: {
    durationMs: number
    duration: number
    width: number
    height: number
  }
  originalFilename: string
}

function createLanguageClient(): ApolloClient<any> {
  if (!process.env.GATEWAY_URL) {
    throw new Error('GATEWAY_URL environment variable is required')
  }

  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'api-media',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache'
      },
      query: {
        fetchPolicy: 'no-cache'
      }
    }
  })
}

async function getLanguageSlug(
  videoSlug: string,
  languageId: string
): Promise<string> {
  let apollo: ApolloClient<any> | null = null
  try {
    apollo = createLanguageClient()
    const { data } = await apollo.query({
      query: GET_LANGUAGE_SLUG,
      variables: { languageId },
      fetchPolicy: 'no-cache'
    })

    if (!data.language?.slug) {
      throw new Error(`No language slug found for language ID: ${languageId}`)
    }

    return `${videoSlug}/${data.language.slug}`
  } finally {
    if (apollo) {
      void apollo.stop()
    }
  }
}

async function waitForMuxVideoCompletion(muxVideo: {
  id: string
  assetId: string | null
}): Promise<
  | { finalStatus: 'ready'; playbackId: string }
  | { finalStatus: 'errored'; playbackId: null }
  | { finalStatus: 'timeout'; playbackId: null }
> {
  const maxAttempts = 480 // 120 minutes (480 * 15 seconds)
  const intervalMs = 15000 // 15 seconds
  let attempts = 0

  if (!muxVideo.assetId) {
    throw new Error(`Mux video ${muxVideo.id} has no assetId`)
  }

  logger.info(
    { muxVideoId: muxVideo.id, assetId: muxVideo.assetId },
    'Waiting for Mux video to be ready for streaming'
  )

  while (attempts < maxAttempts) {
    try {
      const muxVideoAsset = await getVideo(muxVideo.assetId, false)

      if (muxVideoAsset.status === 'errored') {
        logger.error(
          {
            muxVideoId: muxVideo.id,
            assetId: muxVideo.assetId,
            status: muxVideoAsset.status
          },
          'Mux video processing errored'
        )
        return { finalStatus: 'errored', playbackId: null }
      }

      const playbackId = muxVideoAsset?.playback_ids?.[0].id
      if (playbackId != null && muxVideoAsset.status === 'ready') {
        await prisma.muxVideo.update({
          where: { id: muxVideo.id },
          data: {
            playbackId,
            readyToStream: true,
            duration: Math.ceil(muxVideoAsset.duration ?? 0),
            downloadable: true
          }
        })

        logger.info(
          { muxVideoId: muxVideo.id },
          'Skipping download queue in retry script'
        )

        logger.info(
          { muxVideoId: muxVideo.id, playbackId },
          'Mux video is ready for streaming'
        )
        return {
          finalStatus: 'ready',
          playbackId
        }
      }

      if (attempts % 20 === 0 && attempts > 0) {
        const elapsedMinutes = Math.round((attempts * intervalMs) / 60000)
        logger.info(
          {
            muxVideoId: muxVideo.id,
            assetId: muxVideo.assetId,
            status: muxVideoAsset.status,
            attempts: attempts + 1,
            elapsedMinutes
          },
          'Still waiting for Mux video to be ready'
        )
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    } catch (error) {
      logger.error(
        {
          error,
          muxVideoId: muxVideo.id,
          assetId: muxVideo.assetId,
          attempt: attempts + 1
        },
        'Error checking Mux video status'
      )
      attempts++
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }

  logger.warn(
    {
      muxVideoId: muxVideo.id,
      assetId: muxVideo.assetId,
      maxAttempts,
      totalTimeMinutes: (maxAttempts * intervalMs) / 60000
    },
    'Mux video processing reached maximum attempts without becoming ready'
  )
  return { finalStatus: 'timeout', playbackId: null }
}

async function createVideoVariant({
  videoId,
  edition,
  languageId,
  version,
  muxVideoId,
  playbackId,
  metadata
}: {
  videoId: string
  edition: string
  languageId: string
  version: number
  muxVideoId: string
  playbackId: string
  metadata: {
    durationMs: number
    duration: number
    width: number
    height: number
  }
}): Promise<void> {
  const [source, ...restParts] = videoId.split('_')
  const restOfId = restParts.join('_') || videoId
  const variantId = `${source}_${languageId}-${restOfId}`

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL || 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL || 'http://jesusfilm.org/watch/'

  const [videoInfo, existingVariant] = await Promise.all([
    prisma.video.findUnique({
      where: { id: videoId },
      select: { slug: true }
    }),
    prisma.videoVariant.findFirst({
      where: {
        OR: [
          { id: variantId },
          {
            videoId,
            languageId,
            edition
          }
        ]
      },
      select: { id: true, slug: true }
    })
  ])

  if (!videoInfo) {
    throw new Error(`Video not found: ${videoId}`)
  }

  if (!videoInfo.slug) {
    throw new Error(`Video slug not found: ${videoId}`)
  }

  const slug =
    existingVariant?.slug || (await getLanguageSlug(videoInfo.slug, languageId))

  const variantData = {
    hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
    share: `${watchPageBaseUrl}${slug}`,
    duration: metadata.duration,
    lengthInMilliseconds: metadata.durationMs,
    muxVideoId,
    published: true,
    downloadable: true,
    version
  }

  if (existingVariant) {
    await prisma.videoVariant.update({
      where: { id: existingVariant.id },
      data: variantData
    })
    logger.info(
      { variantId: existingVariant.id, version },
      'Updated video variant'
    )
    return
  }

  await prisma.videoVariant.create({
    data: {
      id: variantId,
      videoId,
      edition,
      languageId,
      slug,
      ...variantData
    }
  })
  logger.info({ variantId, version }, 'Created video variant')
}

async function processUploadInline(
  jobData: ProcessVideoUploadJobData
): Promise<void> {
  const childLogger = logger.child({
    module: 'retry-mux-uploads',
    videoId: jobData.videoId,
    languageId: jobData.languageId,
    edition: jobData.edition,
    muxVideoId: jobData.muxVideoId
  })

  childLogger.info('Starting inline video upload processing')

  const muxVideo = await prisma.muxVideo.findUnique({
    where: { id: jobData.muxVideoId }
  })

  if (!muxVideo) {
    childLogger.warn('Mux video not found')
    return
  }

  if (!muxVideo.assetId) {
    childLogger.warn('Mux video has no asset ID')
    return
  }

  const { finalStatus, playbackId } = await waitForMuxVideoCompletion(muxVideo)

  if (finalStatus === 'ready' && playbackId) {
    await createVideoVariant({
      videoId: jobData.videoId,
      edition: jobData.edition,
      languageId: jobData.languageId,
      version: jobData.version,
      muxVideoId: jobData.muxVideoId,
      playbackId,
      metadata: jobData.metadata
    })
  }
  if (finalStatus === 'errored') {
    childLogger.error(
      { muxVideoId: jobData.muxVideoId, finalStatus },
      'Video upload processing failed due to Mux error'
    )
    return
  }

  if (finalStatus === 'timeout') {
    childLogger.warn(
      { muxVideoId: jobData.muxVideoId, finalStatus },
      'Video upload processing failed due to timeout'
    )
  }

  childLogger.info('Finished inline video upload processing')
}

// Same regex as video-importer uses
const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

interface ParsedVideoMetadata {
  videoId: string
  edition: string
  languageId: string
  version: number
}

function parseVideoFilename(filename: string): ParsedVideoMetadata | null {
  const match = filename.match(VIDEO_FILENAME_REGEX)
  if (!match) return null

  const [, videoId, editionName, languageId, version] = match
  const edition = editionName.toLowerCase()
  const parsedVersion = Number.parseInt(version, 10)

  if (Number.isNaN(parsedVersion)) {
    return null
  }

  return {
    videoId,
    edition,
    languageId,
    version: parsedVersion
  }
}

const TARGET_USER_ID = 'hvuvjOW1bnPsqanxufhqnL5SG233'

interface IncompleteUpload {
  r2Asset: {
    id: string
    publicUrl: string
    originalFilename: string
    videoId: string | null
  }
  metadata: ParsedVideoMetadata
  reason: 'no_variant' | 'no_mux_video' | 'mux_missing' | 'mux_not_ready'
  existingVariant?: {
    id: string
    muxVideoId: string | null
  }
  existingMuxVideo?: {
    id: string
    assetId: string | null
    readyToStream: boolean
  }
}

interface ScanResult {
  totalR2Assets: number
  uniqueCombos: number
  skippedAlreadyWorking: number
  skippedInvalidFilename: number
  missingMuxVideoIdCount: number
  muxVideoNotFoundCount: number
  missingMuxVideoSamples: string[]
  nextCursorCreatedAt?: string
  nextCursorId?: string
  incompleteUploads: IncompleteUpload[]
}

/**
 * Scan ALL CloudflareR2 records for the target user and find incomplete uploads.
 * Deduplicates by video/language/edition combo - only keeps the most recent R2 asset.
 */
async function scanAllR2Assets({
  limit,
  pageSize = 1000,
  cursorCreatedAt,
  cursorId
}: {
  limit?: number
  pageSize?: number
  cursorCreatedAt?: Date
  cursorId?: string
}): Promise<ScanResult> {
  const limitValue = limit ?? Number.POSITIVE_INFINITY
  const limitLabel = limit ?? 'all'
  const seenCombos = new Set<string>()
  const incompleteUploads: IncompleteUpload[] = []
  let skippedAlreadyWorking = 0
  let skippedInvalidFilename = 0
  let missingMuxVideoIdCount = 0
  let muxVideoNotFoundCount = 0
  const missingMuxVideoSamples: string[] = []
  let processedCombos = 0
  let duplicateCount = 0
  let uniqueCombos = 0
  let totalFetched = 0
  const progressLogEvery = 1000
  const progressLogIntervalMs = 15000
  const scanStartMs = Date.now()
  let lastProgressLogMs = scanStartMs
  let nextCursorCreatedAt: Date | undefined = cursorCreatedAt
  let nextCursorId: string | undefined = cursorId

  while (totalFetched < limitValue) {
    const take = Math.min(pageSize, limitValue - totalFetched)
    const cursorClause =
      nextCursorCreatedAt && nextCursorId
        ? {
            OR: [
              { createdAt: { lt: nextCursorCreatedAt } },
              {
                createdAt: nextCursorCreatedAt,
                id: { lt: nextCursorId }
              }
            ]
          }
        : {}

    const r2Assets = await prisma.cloudflareR2.findMany({
      where: {
        contentType: 'video/mp4',
        publicUrl: { not: null },
        originalFilename: { not: null },
        userId: TARGET_USER_ID,
        ...cursorClause
      },
      select: {
        id: true,
        publicUrl: true,
        originalFilename: true,
        videoId: true,
        createdAt: true
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take
    })

    if (r2Assets.length === 0) {
      break
    }

    totalFetched += r2Assets.length
    const lastAsset = r2Assets[r2Assets.length - 1]
    nextCursorCreatedAt = lastAsset.createdAt
    nextCursorId = lastAsset.id

    for (const r2Asset of r2Assets) {
      if (!r2Asset.originalFilename || !r2Asset.publicUrl) {
        skippedInvalidFilename++
        continue
      }

      const metadata = parseVideoFilename(r2Asset.originalFilename)
      if (!metadata) {
        skippedInvalidFilename++
        continue
      }

      const comboKey = `${metadata.videoId}|${metadata.languageId}|${metadata.edition}`
      if (seenCombos.has(comboKey)) {
        duplicateCount++
        continue
      }
      seenCombos.add(comboKey)
      uniqueCombos++
      processedCombos++

      const nowMs = Date.now()
      if (
        processedCombos % progressLogEvery === 0 ||
        nowMs - lastProgressLogMs >= progressLogIntervalMs
      ) {
        const elapsedSeconds = Math.round((nowMs - scanStartMs) / 1000)
        console.log(
          `Scan progress: ${processedCombos}/${limitLabel} combos checked (${elapsedSeconds}s elapsed)`
        )
        lastProgressLogMs = nowMs
      }

      // Check if a VideoVariant exists for this video/language/edition combo
      const variantId = `${metadata.languageId}_${metadata.videoId}`
      const existingVariant = await prisma.videoVariant.findFirst({
        where: {
          OR: [
            { id: variantId },
            {
              videoId: metadata.videoId,
              languageId: metadata.languageId,
              edition: metadata.edition
            }
          ]
        },
        select: {
          id: true,
          muxVideoId: true
        }
      })

      // Case 1: No variant exists at all
      if (!existingVariant) {
        incompleteUploads.push({
          r2Asset: {
            id: r2Asset.id,
            publicUrl: r2Asset.publicUrl,
            originalFilename: r2Asset.originalFilename,
            videoId: r2Asset.videoId
          },
          metadata,
          reason: 'no_variant'
        })
        continue
      }

      // Case 2: Variant exists but no muxVideoId
      if (!existingVariant.muxVideoId) {
        missingMuxVideoIdCount++
        if (missingMuxVideoSamples.length < 5) {
          missingMuxVideoSamples.push(
            `${metadata.videoId} (${metadata.languageId}/${metadata.edition}) variantId=${existingVariant.id}`
          )
        }
        incompleteUploads.push({
          r2Asset: {
            id: r2Asset.id,
            publicUrl: r2Asset.publicUrl,
            originalFilename: r2Asset.originalFilename,
            videoId: r2Asset.videoId
          },
          metadata,
          reason: 'no_mux_video',
          existingVariant
        })
        continue
      }

      // Case 3: Check if MuxVideo is ready
      const muxVideo = await prisma.muxVideo.findUnique({
        where: { id: existingVariant.muxVideoId },
        select: {
          id: true,
          assetId: true,
          readyToStream: true
        }
      })

      if (!muxVideo) {
        muxVideoNotFoundCount++
        if (missingMuxVideoSamples.length < 5) {
          missingMuxVideoSamples.push(
            `${metadata.videoId} (${metadata.languageId}/${metadata.edition}) muxVideoId=${existingVariant.muxVideoId}`
          )
        }
        incompleteUploads.push({
          r2Asset: {
            id: r2Asset.id,
            publicUrl: r2Asset.publicUrl,
            originalFilename: r2Asset.originalFilename,
            videoId: r2Asset.videoId
          },
          metadata,
          reason: 'mux_missing',
          existingVariant
        })
        continue
      }

      if (muxVideo && muxVideo.readyToStream) {
        skippedAlreadyWorking++
        continue
      }

      if (muxVideo && !muxVideo.readyToStream) {
        incompleteUploads.push({
          r2Asset: {
            id: r2Asset.id,
            publicUrl: r2Asset.publicUrl,
            originalFilename: r2Asset.originalFilename,
            videoId: r2Asset.videoId
          },
          metadata,
          reason: 'mux_not_ready',
          existingVariant,
          existingMuxVideo: muxVideo
        })
      }
    }
  }

  console.log(`Total R2 assets found: ${totalFetched}`)
  console.log(`Unique video/language/edition combos: ${uniqueCombos}`)
  console.log(`Duplicate R2 assets (older uploads): ${duplicateCount}`)

  return {
    totalR2Assets: totalFetched,
    uniqueCombos,
    skippedAlreadyWorking,
    skippedInvalidFilename,
    missingMuxVideoIdCount,
    muxVideoNotFoundCount,
    missingMuxVideoSamples,
    nextCursorCreatedAt: nextCursorCreatedAt?.toISOString(),
    nextCursorId,
    incompleteUploads
  }
}

interface RetryOptions {
  dryRun?: boolean
  limit?: number
  muxUserId?: string
  exportCsvPath?: string
  cursorCreatedAt?: Date
  cursorId?: string
  scanPageSize?: number
}

interface CsvIssueRow {
  videoId: string
  languageId: string
  edition: string
  version: number
  reason: string
  r2PublicUrl: string
  originalFilename: string
}

function csvEscape(
  value: string | number | boolean | null | undefined
): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  const needsQuotes = /[",\n]/.test(stringValue)
  const escaped = stringValue.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function buildIssuesCsv(incompleteUploads: IncompleteUpload[]): string {
  const header = [
    'videoId',
    'languageId',
    'edition',
    'version',
    'reason',
    'r2AssetId',
    'r2PublicUrl',
    'originalFilename',
    'existingVariantId',
    'existingVariantMuxVideoId',
    'existingMuxVideoId',
    'existingMuxAssetId',
    'existingMuxReadyToStream'
  ]

  const rows = incompleteUploads.map((upload) => {
    const { metadata, r2Asset, existingVariant, existingMuxVideo, reason } =
      upload
    return [
      metadata.videoId,
      metadata.languageId,
      metadata.edition,
      metadata.version,
      reason,
      r2Asset.id,
      r2Asset.publicUrl,
      r2Asset.originalFilename,
      existingVariant?.id ?? '',
      existingVariant?.muxVideoId ?? '',
      existingMuxVideo?.id ?? '',
      existingMuxVideo?.assetId ?? '',
      existingMuxVideo?.readyToStream ?? ''
    ]
      .map(csvEscape)
      .join(',')
  })

  return [header.join(','), ...rows].join('\n')
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      const nextChar = line[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }
    current += char
  }

  values.push(current)
  return values
}

function parseIssuesCsv(contents: string): CsvIssueRow[] {
  const lines = contents.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) return []

  const header = parseCsvLine(lines[0])
  const columnIndex = new Map<string, number>()
  for (let i = 0; i < header.length; i++) {
    columnIndex.set(header[i], i)
  }

  const getValue = (row: string[], key: string): string =>
    row[columnIndex.get(key) ?? -1] ?? ''

  const rows: CsvIssueRow[] = []
  for (const line of lines.slice(1)) {
    const columns = parseCsvLine(line)
    const versionValue = Number.parseInt(getValue(columns, 'version'), 10)
    if (Number.isNaN(versionValue)) {
      continue
    }

    rows.push({
      videoId: getValue(columns, 'videoId'),
      languageId: getValue(columns, 'languageId'),
      edition: getValue(columns, 'edition'),
      version: versionValue,
      reason: getValue(columns, 'reason'),
      r2PublicUrl: getValue(columns, 'r2PublicUrl'),
      originalFilename: getValue(columns, 'originalFilename')
    })
  }

  return rows
}

async function processIssueRow(
  row: CsvIssueRow,
  dryRun: boolean,
  muxUserId: string
): Promise<'processed' | 'skipped'> {
  if (
    !row.videoId ||
    !row.languageId ||
    !row.edition ||
    !row.r2PublicUrl ||
    !row.originalFilename
  ) {
    console.log(`Skipping row with missing required fields.`)
    return 'skipped'
  }

  const metadata: ParsedVideoMetadata = {
    videoId: row.videoId,
    languageId: row.languageId,
    edition: row.edition,
    version: row.version
  }

  const variantId = `${metadata.languageId}_${metadata.videoId}`
  const existingVariant = await prisma.videoVariant.findFirst({
    where: {
      OR: [
        { id: variantId },
        {
          videoId: metadata.videoId,
          languageId: metadata.languageId,
          edition: metadata.edition
        }
      ]
    },
    select: {
      id: true,
      muxVideoId: true
    }
  })

  if (!existingVariant || !existingVariant.muxVideoId) {
    if (dryRun) {
      console.log(
        `Would create new Mux asset for ${metadata.videoId}/${metadata.languageId}/${metadata.edition} (${row.reason})`
      )
      return 'skipped'
    }

    const muxAsset = await createVideoFromUrl(
      row.r2PublicUrl,
      false,
      '2160p',
      true
    )

    const muxVideo = await prisma.muxVideo.create({
      data: {
        assetId: muxAsset.id,
        userId: muxUserId,
        downloadable: true
      }
    })

    await processUploadInline({
      videoId: metadata.videoId,
      edition: metadata.edition,
      languageId: metadata.languageId,
      version: metadata.version,
      muxVideoId: muxVideo.id,
      metadata: { durationMs: 0, duration: 0, width: 0, height: 0 },
      originalFilename: row.originalFilename
    })
    return 'processed'
  }

  const muxVideo = await prisma.muxVideo.findUnique({
    where: { id: existingVariant.muxVideoId },
    select: { id: true, assetId: true, readyToStream: true }
  })

  if (muxVideo?.readyToStream) {
    return 'skipped'
  }

  if (dryRun) {
    console.log(
      `Would process existing MuxVideo ${existingVariant.muxVideoId} for ${metadata.videoId}/${metadata.languageId}/${metadata.edition}`
    )
    return 'skipped'
  }

  if (muxVideo?.assetId) {
    await processUploadInline({
      videoId: metadata.videoId,
      edition: metadata.edition,
      languageId: metadata.languageId,
      version: metadata.version,
      muxVideoId: muxVideo.id,
      metadata: { durationMs: 0, duration: 0, width: 0, height: 0 },
      originalFilename: row.originalFilename
    })
    return 'processed'
  }

  const muxAsset = await createVideoFromUrl(
    row.r2PublicUrl,
    false,
    '2160p',
    true
  )
  const newMuxVideo = await prisma.muxVideo.create({
    data: {
      assetId: muxAsset.id,
      userId: muxUserId,
      downloadable: true
    }
  })

  await processUploadInline({
    videoId: metadata.videoId,
    edition: metadata.edition,
    languageId: metadata.languageId,
    version: metadata.version,
    muxVideoId: newMuxVideo.id,
    metadata: { durationMs: 0, duration: 0, width: 0, height: 0 },
    originalFilename: row.originalFilename
  })
  return 'processed'
}

async function processCsvIssues(
  csvPath: string,
  dryRun: boolean,
  limit: number | undefined,
  muxUserId: string
): Promise<void> {
  const resolvedCsvPath = resolve(csvPath)
  const csvContents = await readFile(resolvedCsvPath, 'utf8')
  const parsedRows = parseIssuesCsv(csvContents)
  const rows = limit ? parsedRows.slice(0, limit) : parsedRows

  console.log(`Loaded ${rows.length} rows from ${resolvedCsvPath}`)

  let processed = 0
  let skipped = 0
  for (const row of rows) {
    const result = await processIssueRow(row, dryRun, muxUserId)
    if (result === 'processed') {
      processed++
    } else {
      skipped++
    }
  }

  console.log('\n=== CSV Processing Summary ===')
  console.log(`Processed: ${processed}`)
  console.log(`Skipped: ${skipped}`)
}

/**
 * Retry Mux uploads for R2 assets that didn't complete processing.
 */
export async function retryMuxUploads(
  options: RetryOptions = {}
): Promise<ScanResult> {
  const {
    dryRun = false,
    limit,
    muxUserId = 'system',
    exportCsvPath,
    cursorCreatedAt,
    cursorId,
    scanPageSize = 1000
  } = options
  const limitLabel = limit ?? 'all'

  console.log(
    `Scanning up to ${limitLabel} R2 assets for user: ${TARGET_USER_ID}...\n`
  )

  const scanResult = await scanAllR2Assets({
    limit,
    pageSize: scanPageSize,
    cursorCreatedAt,
    cursorId
  })

  if (exportCsvPath) {
    const csvContents = buildIssuesCsv(scanResult.incompleteUploads)
    const resolvedExportCsvPath = resolve(exportCsvPath)
    await mkdir(dirname(resolvedExportCsvPath), { recursive: true })
    await writeFile(resolvedExportCsvPath, csvContents, 'utf8')
    console.log(
      `\nCSV export written to: ${resolvedExportCsvPath} (${csvContents.length} bytes)`
    )
  }

  // Show scan summary
  console.log('\n=== After Deduplication ===')
  console.log(
    `Already working (have ready MuxVideo): ${scanResult.skippedAlreadyWorking}`
  )
  console.log(
    `Invalid filename (skipped): ${scanResult.skippedInvalidFilename}`
  )
  console.log(
    `UNIQUE video/lang/edition combos needing fix: ${scanResult.incompleteUploads.length}`
  )
  if (scanResult.nextCursorCreatedAt && scanResult.nextCursorId) {
    console.log('\nNext cursor:')
    console.log(`  createdAt=${scanResult.nextCursorCreatedAt}`)
    console.log(`  id=${scanResult.nextCursorId}`)
  }

  // Group by reason
  const byReason = {
    no_variant: scanResult.incompleteUploads.filter(
      (u) => u.reason === 'no_variant'
    ).length,
    no_mux_video: scanResult.incompleteUploads.filter(
      (u) => u.reason === 'no_mux_video'
    ).length,
    mux_missing: scanResult.incompleteUploads.filter(
      (u) => u.reason === 'mux_missing'
    ).length,
    mux_not_ready: scanResult.incompleteUploads.filter(
      (u) => u.reason === 'mux_not_ready'
    ).length
  }

  console.log('\nBreakdown by issue:')
  console.log(`  - No VideoVariant exists: ${byReason.no_variant}`)
  console.log(`  - VideoVariant has no MuxVideo: ${byReason.no_mux_video}`)
  console.log(
    `  - VideoVariant points to missing MuxVideo: ${byReason.mux_missing}`
  )
  console.log(`  - MuxVideo not ready to stream: ${byReason.mux_not_ready}`)
  console.log('\nMuxVideo check details:')
  console.log(
    `  - Variants missing muxVideoId: ${scanResult.missingMuxVideoIdCount}`
  )
  console.log(
    `  - Variants with muxVideoId but no record: ${scanResult.muxVideoNotFoundCount}`
  )
  if (scanResult.missingMuxVideoSamples.length > 0) {
    console.log('  - Sample variants with missing MuxVideo:')
    for (const sample of scanResult.missingMuxVideoSamples) {
      console.log(`    * ${sample}`)
    }
  }

  if (dryRun) {
    // In dry-run, show details for first 100 only
    const detailLimit = Math.min(100, scanResult.incompleteUploads.length)
    if (detailLimit > 0) {
      console.log(`\n=== First ${detailLimit} items (detailed) ===`)
      for (let i = 0; i < detailLimit; i++) {
        const upload = scanResult.incompleteUploads[i]
        console.log(`\n${i + 1}. ${upload.r2Asset.originalFilename}`)
        console.log(
          `   Video: ${upload.metadata.videoId}, Lang: ${upload.metadata.languageId}, Edition: ${upload.metadata.edition}`
        )
        console.log(`   Issue: ${upload.reason}`)
        console.log(`   R2 URL: ${upload.r2Asset.publicUrl}`)
      }
    }

    console.log('\n=== DRY RUN Summary ===')
    console.log(
      `Total VideoVariants that need fixing: ${scanResult.incompleteUploads.length}`
    )
    console.log(`\nTo process, run without --dry-run flag`)
    console.log(`Use --limit=N to process N items at a time (default: 100)`)
    return scanResult
  }

  // Not dry-run - process up to limit
  const toProcess = limit
    ? scanResult.incompleteUploads.slice(0, limit)
    : scanResult.incompleteUploads
  console.log(`\n=== Processing ${toProcess.length} items ===`)

  let processed = 0
  let failed = 0

  for (const upload of toProcess) {
    const { r2Asset, metadata, existingMuxVideo } = upload

    console.log(
      `\nProcessing: ${r2Asset.originalFilename} (${metadata.videoId}, ${metadata.languageId}, ${metadata.edition})`
    )

    // If there's an existing MuxVideo that's not ready, re-queue
    if (existingMuxVideo?.assetId) {
      console.log(
        `  Existing MuxVideo found (id: ${existingMuxVideo.id}), processing inline...`
      )

      try {
        await processUploadInline({
          videoId: metadata.videoId,
          edition: metadata.edition,
          languageId: metadata.languageId,
          version: metadata.version,
          muxVideoId: existingMuxVideo.id,
          metadata: { durationMs: 0, duration: 0, width: 0, height: 0 },
          originalFilename: r2Asset.originalFilename
        })
        console.log(`  Finished inline processing`)
        processed++
      } catch (error) {
        console.error(`  Failed inline processing:`, error)
        failed++
      }
      continue
    }

    // Create new Mux asset
    try {
      console.log(`  Creating Mux asset...`)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Rate limit

      const muxAsset = await createVideoFromUrl(
        r2Asset.publicUrl,
        false,
        '2160p',
        true
      )

      console.log(`  Created Mux asset: ${muxAsset.id}`)

      const muxVideo = await prisma.muxVideo.create({
        data: {
          assetId: muxAsset.id,
          userId: muxUserId,
          downloadable: true
        }
      })

      console.log(`  Created MuxVideo: ${muxVideo.id}`)

      await processUploadInline({
        videoId: metadata.videoId,
        edition: metadata.edition,
        languageId: metadata.languageId,
        version: metadata.version,
        muxVideoId: muxVideo.id,
        metadata: { durationMs: 0, duration: 0, width: 0, height: 0 },
        originalFilename: r2Asset.originalFilename
      })

      console.log(`  Finished inline processing`)
      processed++
    } catch (error) {
      console.error(`  Failed:`, error)
      failed++
    }
  }

  console.log('\n=== Processing Summary ===')
  console.log(`Processed: ${processed}`)
  console.log(`Failed: ${failed}`)
  console.log(
    `Remaining: ${scanResult.incompleteUploads.length - toProcess.length}`
  )
  return scanResult
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const noLimit = args.includes('--no-limit')
  const limitArg = args.find((arg) => arg.startsWith('--limit='))
  const limit = noLimit
    ? undefined
    : limitArg
      ? parseInt(limitArg.split('=')[1], 10)
      : 100
  const scanPageSizeArg = args.find((arg) =>
    arg.startsWith('--scan-page-size=')
  )
  const scanPageSize = scanPageSizeArg
    ? parseInt(scanPageSizeArg.split('=')[1], 10)
    : 1000
  const cursorCreatedAtArg = args.find((arg) =>
    arg.startsWith('--cursor-created-at=')
  )
  const cursorIdArg = args.find((arg) => arg.startsWith('--cursor-id='))
  const cursorCreatedAt = cursorCreatedAtArg
    ? new Date(cursorCreatedAtArg.split('=')[1])
    : undefined
  const cursorId = cursorIdArg ? cursorIdArg.split('=')[1] : undefined
  if (
    (cursorCreatedAt && !cursorId) ||
    (!cursorCreatedAt && cursorId) ||
    (cursorCreatedAt && Number.isNaN(cursorCreatedAt.getTime()))
  ) {
    throw new Error(
      'Both --cursor-created-at and --cursor-id are required with a valid ISO timestamp'
    )
  }
  const processCsvArg = args.find((arg) => arg.startsWith('--process-csv='))
  const processCsvPath = processCsvArg
    ? processCsvArg.slice('--process-csv='.length)
    : undefined
  const noExportCsv = args.includes('--no-export-csv')
  const exportCsvArg = args.find(
    (arg) => arg === '--export-csv' || arg.startsWith('--export-csv=')
  )
  const exportCsvPath = noExportCsv
    ? undefined
    : exportCsvArg
      ? exportCsvArg.startsWith('--export-csv=')
        ? exportCsvArg.slice('--export-csv='.length) || DEFAULT_EXPORT_CSV_PATH
        : DEFAULT_EXPORT_CSV_PATH
      : DEFAULT_EXPORT_CSV_PATH

  console.log('=== Retry Mux Uploads Script ===')
  console.log(`Target user: ${TARGET_USER_ID}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN (scan only)' : 'LIVE (will process)'}`)
  console.log(`Limit: ${limit ?? 'all'}`)
  console.log(`Scan page size: ${scanPageSize}`)
  if (cursorCreatedAt && cursorId) {
    console.log(`Cursor createdAt: ${cursorCreatedAt.toISOString()}`)
    console.log(`Cursor id: ${cursorId}`)
  }
  if (processCsvPath) console.log(`Processing CSV: ${processCsvPath}`)
  if (exportCsvPath) console.log(`CSV export: ${exportCsvPath}`)
  console.log('')

  try {
    if (processCsvPath) {
      await processCsvIssues(processCsvPath, dryRun, limit, 'system')
    } else {
      await retryMuxUploads({
        dryRun,
        limit,
        exportCsvPath,
        cursorCreatedAt,
        cursorId,
        scanPageSize
      })
    }
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}

export { DEFAULT_EXPORT_CSV_PATH, parseVideoFilename, processCsvIssues }
