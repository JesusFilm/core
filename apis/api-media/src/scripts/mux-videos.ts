import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import Mux from '@mux/mux-node'

import {
  Prisma,
  VideoVariantDownloadQuality,
  prisma
} from '../../../../libs/prisma/media/src/client'
import {
  createDownloadsFromMuxAsset,
  downloadsReadyToStore,
  previewMuxDownloadsFromAsset
} from '../lib/downloads'
import { videoVariantCacheReset } from '../lib/videoCacheReset'
import { getVideo } from '../schema/mux/video/service'

const MUX_STREAM_BASE_URL = 'https://stream.mux.com'
const DISTRO_DOWNLOAD_QUALITIES = [
  VideoVariantDownloadQuality.distroLow,
  VideoVariantDownloadQuality.distroSd,
  VideoVariantDownloadQuality.distroHigh
]
// low, sd, high, fhd, qhd, uhd, highest -- every non-distro quality a ready
// Mux asset can produce. Used as an upper bound when looking for variants
// missing Mux download rows entirely (see the "missing rows" pass below), not
// as a per-variant expectation: lower-resolution masters legitimately produce
// fewer of these, and createDownloadsFromMuxAsset() is a safe no-op for rows
// that already exist and don't need a metadata refresh. Overridable via
// MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT for a targeted run against a
// cohort whose real ceiling is known to be lower (e.g. a catalog with no
// 1440p/2160p masters, where qhd/uhd never appear and this default of 7
// makes nearly every variant a false-positive candidate).
const DEFAULT_MAX_REAL_DOWNLOAD_QUALITY_COUNT = 7

// getVideo() is a lightweight read against Mux's Video API, not the asset
// creation/upload calls importMuxVideos()/updateHls() serialize with their
// own 2s sleeps -- there's no evidence it needs the same headroom. Bounded
// concurrency (a handful of variants in flight at once, each with a small
// stagger before its own call) gets meaningfully more throughput than one
// request every 1.5s while staying well under the prod pool's
// connection_limit and any reasonable Mux read-rate ceiling.
const DEFAULT_PROCESS_CONCURRENCY = 4
const MUX_API_CALL_STAGGER_MS = 250

async function processConcurrently<T>(
  items: T[],
  concurrency: number,
  handler: (item: T) => Promise<void>
): Promise<void> {
  for (let index = 0; index < items.length; index += concurrency) {
    await Promise.all(items.slice(index, index + concurrency).map(handler))
  }
}

function getMuxClient(): Mux {
  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

export async function createMuxAsset(url: string, mux: Mux): Promise<string> {
  const muxVideo = await mux.video.assets.create({
    inputs: [
      {
        url: url
      }
    ],
    video_quality: 'plus',
    playback_policy: ['public'],
    max_resolution_tier: '2160p',
    static_renditions: [
      { resolution: '270p' },
      { resolution: '360p' },
      { resolution: '480p' },
      { resolution: '720p' },
      { resolution: '1080p' },
      { resolution: '1440p' },
      { resolution: '2160p' }
    ]
  })
  return muxVideo.id
}

export async function importMuxVideos(mux: Mux): Promise<void> {
  console.log('mux videos import started')

  let totalImported = 0
  const take = 100
  let hasMore = true
  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        AND: [
          { videoId: { not: { startsWith: '1_' } } },
          { videoId: { not: { startsWith: 'MAG' } } }
        ],
        muxVideoId: null,
        masterUrl: { not: null }
      },
      take
    })

    console.log(`Found ${variants.length} variants to import`)

    for (const variant of variants) {
      console.log(`Importing mux video for variant ${variant.id}`)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // wait 2 sec to avoid rate limit
      let muxVideoId: string | null
      try {
        muxVideoId = await createMuxAsset(variant.masterUrl as string, mux)
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Error creating mux asset for variant ${variant.id}: ${error.message}`
          )
        } else {
          console.error(`Error creating mux asset for variant ${variant.id}`)
        }
        continue
      }

      if (muxVideoId == null) {
        console.error(`Mux video id is null for variant ${variant.id}`)
        continue
      }

      try {
        await prisma.videoVariant.update({
          where: {
            id: variant.id
          },
          data: {
            muxVideo: {
              create: {
                assetId: muxVideoId,
                userId: 'system',
                downloadable: true
              }
            }
          }
        })
      } catch (error) {
        // remove mux video if error
        await prisma.muxVideo.delete({
          where: {
            assetId: muxVideoId
          }
        })

        await mux.video.assets.delete(muxVideoId)

        if (error instanceof Error) {
          console.error(
            `Error updating video variant ${variant.id}: ${error.message}`
          )
        } else {
          console.error(`Error updating video variant ${variant.id}`)
        }
      }

      totalImported++
    }

    if (variants.length === 0) {
      hasMore = false
    }
  }

  console.log(`Imported ${totalImported} mux videos`)
}

export async function updateHls(mux: Mux): Promise<void> {
  console.log('mux videos update started')

  const take = 100
  let hasMore = true
  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        id: { not: { contains: '-jf61' } },
        video: {
          slug: { not: { startsWith: 'jesus/' } }
        },
        muxVideoId: { not: null },
        hls: { not: { startsWith: 'https://stream.mux.com' } },
        muxVideo: {
          assetId: { not: null },
          playbackId: null
        }
      },
      include: {
        muxVideo: true
      },
      take
    })

    console.log(`Found ${variants.length} variants to update`)

    for (const variant of variants) {
      console.log(`Attempting to update hls for variant ${variant.id}`)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // wait 2 sec to avoid rate limit

      let muxVideo: Mux.Video.Asset | null
      try {
        muxVideo = await mux.video.assets.retrieve(
          variant.muxVideo?.assetId as string
        )
      } catch (error) {
        console.error(
          `Error retrieving mux upload for variant ${variant.id}`,
          error
        )
        continue
      }
      try {
        const playbackId = muxVideo?.playback_ids?.[0].id
        if (playbackId != null && muxVideo.status === 'ready') {
          await prisma.videoVariant.update({
            where: {
              id: variant.id
            },
            data: {
              hls: `https://stream.mux.com/${playbackId}.m3u8`,
              brightcoveId: null,
              muxVideo: {
                update: {
                  playbackId,
                  readyToStream: true
                }
              }
            }
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Error updating video variant ${variant.id}: ${error.message}`
          )
        } else {
          console.error(`Error updating video variant ${variant.id}`)
        }
      }
    }

    if (variants.length === 0) {
      hasMore = false
    }
  }
}

export async function processDownloads(): Promise<void> {
  console.log('mux downloads processing started')

  const applyChanges = process.env.MUX_DOWNLOAD_BACKFILL_APPLY === 'true'
  const sampleSizeValue = process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE?.trim()
  const sampleSize =
    sampleSizeValue != null && sampleSizeValue !== ''
      ? Number.parseInt(sampleSizeValue, 10)
      : null

  if (sampleSize != null && (!Number.isFinite(sampleSize) || sampleSize <= 0)) {
    throw new Error(
      'MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE must be a positive integer'
    )
  }

  const maxQualityCountValue =
    process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT?.trim()
  const maxRealDownloadQualityCount =
    maxQualityCountValue != null && maxQualityCountValue !== ''
      ? Number.parseInt(maxQualityCountValue, 10)
      : DEFAULT_MAX_REAL_DOWNLOAD_QUALITY_COUNT

  if (
    !Number.isFinite(maxRealDownloadQualityCount) ||
    maxRealDownloadQualityCount <= 0
  ) {
    throw new Error(
      'MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT must be a positive integer'
    )
  }

  const concurrencyValue = process.env.MUX_DOWNLOAD_BACKFILL_CONCURRENCY?.trim()
  const concurrency =
    concurrencyValue != null && concurrencyValue !== ''
      ? Number.parseInt(concurrencyValue, 10)
      : DEFAULT_PROCESS_CONCURRENCY

  if (!Number.isFinite(concurrency) || concurrency <= 0) {
    throw new Error(
      'MUX_DOWNLOAD_BACKFILL_CONCURRENCY must be a positive integer'
    )
  }

  if (applyChanges) {
    console.log('Apply mode enabled: download metadata rows will be refreshed')
  } else {
    console.log(
      'Preview mode enabled: no download rows will be changed and replacement values will be printed'
    )
  }
  if (sampleSize != null) {
    console.log(
      `Sample size limit enabled: processing up to ${sampleSize} variants`
    )
  }

  type ZeroMetadataDownloadRow = Prisma.VideoVariantDownloadGetPayload<{
    include: {
      videoVariant: {
        include: {
          muxVideo: true
        }
      }
    }
  }>

  const zeroMetadataWhere: Prisma.VideoVariantDownloadWhereInput = {
    quality: {
      notIn: DISTRO_DOWNLOAD_QUALITIES
    },
    videoVariantId: {
      not: null
    },
    url: {
      startsWith: MUX_STREAM_BASE_URL
    },
    OR: [{ size: null }, { size: 0 }, { bitrate: null }, { bitrate: 0 }]
  }

  let hasMore = true
  let totalProcessed = 0
  let nextCursor: string | null = null
  let carryoverDownloads: ZeroMetadataDownloadRow[] = []

  const processVariant = async (
    variant: Prisma.VideoVariantGetPayload<{
      include: {
        muxVideo: true
      }
    }>,
    variantZeroMetadataDownloads: ZeroMetadataDownloadRow[]
  ): Promise<void> => {
    console.log(
      `Processing downloads for variant ${variant.id}, zero-metadata download count: ${variantZeroMetadataDownloads.length}`
    )

    if (!variant.muxVideo?.assetId) {
      console.log(
        `Skipping Mux-backed downloads for variant ${variant.id}: mux video has no assetId to repair from`
      )
      return
    }

    await new Promise((resolve) => setTimeout(resolve, MUX_API_CALL_STAGGER_MS))

    try {
      const muxVideoAsset = await getVideo(variant.muxVideo.assetId, false)

      if (
        muxVideoAsset.status === 'ready' &&
        muxVideoAsset.playback_ids?.[0]?.id != null &&
        downloadsReadyToStore(muxVideoAsset)
      ) {
        if (!applyChanges) {
          const previewDownloads = previewMuxDownloadsFromAsset({
            variantId: variant.id,
            muxVideoAsset
          })
          const previewByQuality = new Map(
            previewDownloads.map(
              (download): [typeof download.quality, typeof download] => [
                download.quality,
                download
              ]
            )
          )

          console.log(
            `Preview for variant ${variant.id}, muxVideoId: ${variant.muxVideo.id}`
          )
          if (variantZeroMetadataDownloads.length === 0) {
            console.log(
              `  ${previewDownloads.length} download row(s) would be created or refreshed (variant has fewer than ${maxRealDownloadQualityCount} Mux-hosted rows)`
            )
            return
          }
          for (const download of variantZeroMetadataDownloads) {
            const replacement = previewByQuality.get(download.quality)
            if (replacement == null) {
              console.log(
                `  quality=${download.quality}: no replacement generated from current Mux renditions`
              )
              continue
            }

            console.log(
              `  quality=${download.quality}: size ${download.size ?? 'null'} -> ${replacement.size}, bitrate ${download.bitrate ?? 'null'} -> ${replacement.bitrate}`
            )
          }
          return
        }

        const createdCount = await createDownloadsFromMuxAsset({
          variantId: variant.id,
          muxVideoAsset
        })

        console.log(
          `Successfully created or refreshed ${createdCount} video downloads for variant ${variant.id}, muxVideoId: ${variant.muxVideo.id}`
        )

        if (createdCount > 0) {
          await videoVariantCacheReset(variant.id)
        }
      } else {
        console.log(
          `Video not ready for download processing - variant: ${variant.id}, assetId: ${variant.muxVideo.assetId}, status: ${muxVideoAsset.status}, hasPlaybackId: ${!!muxVideoAsset.playback_ids?.[0]?.id}, downloadsReady: ${downloadsReadyToStore(muxVideoAsset)}`
        )
      }
    } catch (error) {
      console.error(
        `Failed to process downloads for variant ${variant.id}, assetId: ${variant.muxVideo.assetId}`,
        error
      )
    }
  }

  while (hasMore) {
    const remainingSampleSize =
      sampleSize == null ? null : sampleSize - totalProcessed
    if (remainingSampleSize != null && remainingSampleSize <= 0) {
      break
    }

    const take =
      remainingSampleSize == null ? 500 : Math.max(100, remainingSampleSize * 5)
    const zeroMetadataDownloads: ZeroMetadataDownloadRow[] =
      await prisma.videoVariantDownload.findMany({
        where: zeroMetadataWhere,
        include: {
          videoVariant: {
            include: {
              muxVideo: true
            }
          }
        },
        orderBy: [{ videoVariantId: 'asc' }, { id: 'asc' }],
        ...(nextCursor == null
          ? {}
          : {
              cursor: {
                id: nextCursor
              },
              skip: 1
            }),
        take
      })

    const downloadsWithCarryover = [
      ...carryoverDownloads,
      ...zeroMetadataDownloads
    ]
    carryoverDownloads = []

    let completeDownloads = downloadsWithCarryover
    const lastDownload = downloadsWithCarryover.at(-1)
    if (
      zeroMetadataDownloads.length === take &&
      lastDownload?.videoVariantId != null
    ) {
      let trailingIndex = downloadsWithCarryover.length - 1
      while (
        trailingIndex >= 0 &&
        downloadsWithCarryover[trailingIndex]?.videoVariantId ===
          lastDownload.videoVariantId
      ) {
        trailingIndex--
      }
      carryoverDownloads = downloadsWithCarryover.slice(trailingIndex + 1)
      completeDownloads = downloadsWithCarryover.slice(0, trailingIndex + 1)
    }

    const downloadsByVariant = new Map<string, ZeroMetadataDownloadRow[]>()
    for (const download of completeDownloads) {
      const variantId = download.videoVariantId
      if (variantId == null) continue

      const downloadsForVariant = downloadsByVariant.get(variantId)
      if (downloadsForVariant == null) {
        downloadsByVariant.set(variantId, [download])
      } else {
        downloadsForVariant.push(download)
      }
    }

    const variants = Array.from(downloadsByVariant.values())
      .map((downloads) => downloads[0]?.videoVariant)
      .filter(
        (
          variant
        ): variant is Prisma.VideoVariantGetPayload<{
          include: {
            muxVideo: true
          }
        }> => variant != null
      )

    const variantsToProcess =
      remainingSampleSize == null
        ? variants
        : variants.slice(0, remainingSampleSize)

    console.log(
      `Found ${variantsToProcess.length} variants with zero-metadata download rows to process in this batch`
    )

    await processConcurrently(
      variantsToProcess,
      concurrency,
      async (variant) => {
        const variantZeroMetadataDownloads =
          downloadsByVariant.get(variant.id) ?? []
        await processVariant(variant, variantZeroMetadataDownloads)
      }
    )
    totalProcessed += variantsToProcess.length

    nextCursor = zeroMetadataDownloads.at(-1)?.id ?? null

    if (zeroMetadataDownloads.length < take || nextCursor == null) {
      hasMore = false
    }
  }

  if (
    carryoverDownloads.length > 0 &&
    (sampleSize == null || totalProcessed < sampleSize)
  ) {
    const downloadsByVariant = new Map<string, ZeroMetadataDownloadRow[]>()
    for (const download of carryoverDownloads) {
      const variantId = download.videoVariantId
      if (variantId == null) continue

      const downloadsForVariant = downloadsByVariant.get(variantId)
      if (downloadsForVariant == null) {
        downloadsByVariant.set(variantId, [download])
      } else {
        downloadsForVariant.push(download)
      }
    }

    for (const [variantId, variantDownloads] of downloadsByVariant) {
      if (sampleSize != null && totalProcessed >= sampleSize) {
        break
      }

      const variant = variantDownloads[0]?.videoVariant
      if (variant == null) {
        continue
      }

      console.log(
        `Found final carryover variant ${variantId} with ${variantDownloads.length} zero-metadata download rows`
      )
      await processVariant(variant, variantDownloads)
      totalProcessed++
    }
  }

  // Second pass: the loop above only ever discovers variants that already
  // have an EXISTING Mux-hosted download row with null/zero size or bitrate.
  // A variant whose muxVideoId is set but that is missing a quality's row
  // entirely -- never created, not just broken -- has no such row to match
  // that query, so it's invisible to the pass above. Find those directly off
  // VideoVariant and route them through the same processVariant() repair
  // path; createDownloadsFromMuxAsset() only creates what's actually absent.
  // Optional operational scope: a comma-separated list of videoId prefixes
  // (e.g. "1_,MAG") to target a specific catalog cohort instead of scanning
  // the whole table by ascending id -- useful when a prior investigation
  // already sized a cohort's gap and an unscoped run would spend its sample
  // budget on unrelated, lexicographically-earlier ids first.
  const videoIdPrefixes =
    process.env.MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES?.split(',')
      .map((prefix) => prefix.trim())
      .filter((prefix) => prefix.length > 0)

  // Optional resume point. MUX_DOWNLOAD_BACKFILL_START_AFTER_ID sets a
  // one-off starting cursor (e.g. the last id an interrupted run logged).
  // MUX_DOWNLOAD_BACKFILL_CURSOR_FILE goes further: given a file path, the
  // cursor is read from it at startup (if present) and written back after
  // every completed page, so a run interrupted by a connection drop or the
  // process being killed can simply be re-invoked with the same file and
  // pick up exactly where it left off -- no need to read logs and pass an
  // explicit START_AFTER_ID by hand. An explicit START_AFTER_ID still wins
  // over the file, for deliberately overriding a stale or missing cursor.
  const cursorFilePath = process.env.MUX_DOWNLOAD_BACKFILL_CURSOR_FILE?.trim()
  const cursorFromFile =
    cursorFilePath != null && existsSync(cursorFilePath)
      ? readFileSync(cursorFilePath, 'utf-8').trim()
      : null

  let missingRowsCursor =
    process.env.MUX_DOWNLOAD_BACKFILL_START_AFTER_ID?.trim() ??
    cursorFromFile ??
    ''
  if (cursorFilePath != null) {
    console.log(
      `Missing-rows pass resuming from cursor: ${missingRowsCursor === '' ? '(start)' : missingRowsCursor} (file: ${cursorFilePath})`
    )
  }
  let hasMoreMissingRows = true

  while (hasMoreMissingRows) {
    const remainingSampleSize =
      sampleSize == null ? null : sampleSize - totalProcessed
    if (remainingSampleSize != null && remainingSampleSize <= 0) {
      break
    }

    const take =
      remainingSampleSize == null ? 200 : Math.min(200, remainingSampleSize)

    const prefixFilter =
      videoIdPrefixes == null || videoIdPrefixes.length === 0
        ? Prisma.empty
        : Prisma.sql`AND (${Prisma.join(
            // LEFT(...) = prefix, not LIKE 'prefix%' -- LIKE treats '_' as a
            // single-character wildcard, so a literal prefix like "1_" would
            // also match unrelated ids like "10_21028-...".
            videoIdPrefixes.map(
              (prefix) =>
                Prisma.sql`LEFT(v."videoId", ${prefix.length}) = ${prefix}`
            ),
            ' OR '
          )})`

    const candidates = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT v.id
      FROM "VideoVariant" v
      LEFT JOIN "VideoVariantDownload" d
        ON d."videoVariantId" = v.id
        AND d.url LIKE ${MUX_STREAM_BASE_URL + '/%'}
      WHERE v."muxVideoId" IS NOT NULL
        AND v.id > ${missingRowsCursor}
        ${prefixFilter}
      GROUP BY v.id
      HAVING COUNT(d.id) < ${maxRealDownloadQualityCount}
      ORDER BY v.id
      LIMIT ${take}
    `

    if (candidates.length === 0) {
      break
    }

    const variants = await prisma.videoVariant.findMany({
      where: { id: { in: candidates.map((candidate) => candidate.id) } },
      include: { muxVideo: true }
    })

    console.log(
      `Found ${variants.length} variants with fewer than ${maxRealDownloadQualityCount} Mux-hosted download rows to process in this batch`
    )

    await processConcurrently(variants, concurrency, async (variant) => {
      await processVariant(variant, [])
    })
    totalProcessed += variants.length

    missingRowsCursor = candidates.at(-1)?.id ?? missingRowsCursor
    if (cursorFilePath != null) {
      writeFileSync(cursorFilePath, missingRowsCursor)
    }

    if (candidates.length < take) {
      hasMoreMissingRows = false
    }
  }

  console.log(`Processed downloads for ${totalProcessed} variants`)
}

/**
 * Main function to run all Mux video processing tasks
 */
async function runMuxVideosScript(): Promise<void> {
  console.log('Starting Mux Videos processing script...')

  try {
    const downloadsOnly = process.env.MUX_DOWNLOAD_BACKFILL_ONLY === 'true'

    if (!downloadsOnly) {
      const mux = getMuxClient()

      // Run all three processes in sequence
      await importMuxVideos(mux)
      await updateHls(mux)
    } else {
      console.log('Downloads-only mode enabled: skipping import and HLS update')
    }

    await processDownloads()

    console.log('Mux Videos processing completed successfully!')
  } catch (error) {
    console.error('Mux Videos processing failed:', error)
    throw error
  }
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  try {
    await runMuxVideosScript()
    console.log('Script completed successfully!')
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  void main()
}

export { runMuxVideosScript }
