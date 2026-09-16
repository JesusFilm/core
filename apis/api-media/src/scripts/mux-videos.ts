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
  previewMuxDownloadsFromAsset,
  qualityEnumToOrder
} from '../lib/downloads'
import { videoVariantCacheReset } from '../lib/videoCacheReset'
import { getVideo } from '../schema/mux/video/service'

const MUX_STREAM_BASE_URL = 'https://stream.mux.com'
const DISTRO_DOWNLOAD_QUALITIES: VideoVariantDownloadQuality[] = [
  VideoVariantDownloadQuality.distroLow,
  VideoVariantDownloadQuality.distroSd,
  VideoVariantDownloadQuality.distroHigh
]
// low, sd, high, fhd, qhd, uhd, highest: an upper bound on the Mux-hosted
// rows one variant can have, used to spot variants missing rows entirely (see
// the "missing rows" pass below). Not a per-variant expectation -- a
// lower-resolution master legitimately produces fewer, and processing those
// again is a harmless no-op.
const MAX_MUX_DOWNLOAD_QUALITY_COUNT = Object.keys(qualityEnumToOrder).filter(
  (quality) =>
    !DISTRO_DOWNLOAD_QUALITIES.includes(quality as VideoVariantDownloadQuality)
).length

// getVideo() is a lightweight read against Mux's Video API, not one of the
// asset creation calls importMuxVideos()/updateHls() serialize with their own
// 2s sleeps. Bounded concurrency with a small per-call stagger stays well
// under the prod pool's connection_limit and any reasonable Mux read-rate
// ceiling.
const DEFAULT_PROCESS_CONCURRENCY = 4
const MUX_API_CALL_STAGGER_MS = 250

// Reads an optional positive-integer env var. Validates the whole string, not
// just its leading digits -- Number.parseInt('5junk', 10) is 5.
function parsePositiveIntegerEnv(name: string): number | null {
  const value = process.env[name]?.trim()
  if (value == null || value === '') return null

  if (!/^\d+$/.test(value) || Number.parseInt(value, 10) <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return Number.parseInt(value, 10)
}

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
  const sampleSize = parsePositiveIntegerEnv(
    'MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE'
  )
  const concurrency =
    parsePositiveIntegerEnv('MUX_DOWNLOAD_BACKFILL_CONCURRENCY') ??
    DEFAULT_PROCESS_CONCURRENCY

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
  // Variants the zero-metadata pass already handed to processVariant(), so the
  // missing-rows pass doesn't re-fetch them from Mux or spend sample budget on
  // them again.
  const processedVariantIds = new Set<string>()

  const processVariant = async (
    variant: Prisma.VideoVariantGetPayload<{
      include: {
        muxVideo: true
      }
    }>,
    variantZeroMetadataDownloads: ZeroMetadataDownloadRow[]
  ): Promise<boolean> => {
    processedVariantIds.add(variant.id)
    console.log(
      `Processing downloads for variant ${variant.id}, zero-metadata download count: ${variantZeroMetadataDownloads.length}`
    )

    if (!variant.muxVideo?.assetId) {
      console.log(
        `Skipping Mux-backed downloads for variant ${variant.id}: mux video has no assetId to repair from`
      )
      return true
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
              `  candidate: ${previewDownloads.length} Mux download rendition(s) available; apply mode creates or refreshes only the rows that are missing, non-Mux, or missing metadata`
            )
            return true
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
          return true
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
        // The asset still needs repair on a later run, so report it as
        // incomplete. Returning true here advanced the missing-row cursor past
        // the variant and it was never revisited.
        return false
      }
      return true
    } catch (error) {
      console.error(
        `Failed to process downloads for variant ${variant.id}, assetId: ${variant.muxVideo.assetId}`,
        error
      )
      return false
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
  // MUX_DOWNLOAD_BACKFILL_CURSOR_FILE: given a file path, the cursor is read
  // from it at startup and written back after each page, so a run interrupted
  // by a connection drop can be re-invoked with the same file and pick up
  // where it left off.
  const cursorFilePath = process.env.MUX_DOWNLOAD_BACKFILL_CURSOR_FILE?.trim()

  let missingRowsCursor =
    cursorFilePath != null && existsSync(cursorFilePath)
      ? readFileSync(cursorFilePath, 'utf-8').trim()
      : ''
  // The cursor is only persisted up to the last variant that completed, so an
  // interrupted or failed one is retried by the next run rather than skipped.
  let persistedCursor = missingRowsCursor
  let hasUnretriedFailure = false
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

    const candidates = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT v.id
      FROM "VideoVariant" v
      LEFT JOIN "VideoVariantDownload" d
        ON d."videoVariantId" = v.id
        AND d.url LIKE ${MUX_STREAM_BASE_URL + '/%'}
      WHERE v."muxVideoId" IS NOT NULL
        AND v.id > ${missingRowsCursor}
      GROUP BY v.id
      HAVING COUNT(d.id) < ${MAX_MUX_DOWNLOAD_QUALITY_COUNT}
      ORDER BY v.id
      LIMIT ${take}
    `

    if (candidates.length === 0) {
      break
    }

    const unprocessedCandidateIds = candidates
      .map((candidate) => candidate.id)
      .filter((id) => !processedVariantIds.has(id))

    const variants =
      unprocessedCandidateIds.length === 0
        ? []
        : await prisma.videoVariant.findMany({
            where: { id: { in: unprocessedCandidateIds } },
            include: { muxVideo: true }
          })

    console.log(
      `Found ${variants.length} variants with fewer than ${MAX_MUX_DOWNLOAD_QUALITY_COUNT} Mux-hosted download rows to process in this batch`
    )

    const failedVariantIds = new Set<string>()
    await processConcurrently(variants, concurrency, async (variant) => {
      const completed = await processVariant(variant, [])
      if (!completed) failedVariantIds.add(variant.id)
    })
    totalProcessed += variants.length

    missingRowsCursor = candidates.at(-1)?.id ?? missingRowsCursor

    if (!hasUnretriedFailure) {
      const firstFailedIndex = candidates.findIndex((candidate) =>
        failedVariantIds.has(candidate.id)
      )
      hasUnretriedFailure = firstFailedIndex !== -1
      persistedCursor =
        firstFailedIndex === -1
          ? missingRowsCursor
          : (candidates[firstFailedIndex - 1]?.id ?? persistedCursor)

      if (cursorFilePath != null) {
        writeFileSync(cursorFilePath, persistedCursor)
      }
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
