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
import { getVideo } from '../schema/mux/video/service'

const MUX_STREAM_BASE_URL = 'https://stream.mux.com'
const DISTRO_DOWNLOAD_QUALITIES = [
  VideoVariantDownloadQuality.distroLow,
  VideoVariantDownloadQuality.distroSd,
  VideoVariantDownloadQuality.distroHigh
]

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
      let muxVideoId: string | null = null
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

      let muxVideo: Mux.Video.Asset | null = null
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

  if (applyChanges) {
    console.log('Apply mode enabled: download metadata rows will be refreshed')
  } else {
    console.log(
      'Preview mode enabled: no download rows will be changed and replacement values will be printed'
    )
  }
  if (sampleSize != null) {
    console.log(`Sample size limit enabled: processing up to ${sampleSize} variants`)
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

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const muxVideoAsset = await getVideo(variant.muxVideo.assetId, false)

      if (
        muxVideoAsset.status === 'ready' &&
        muxVideoAsset.playback_ids?.[0].id != null &&
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
      } else {
        console.log(
          `Video not ready for download processing - variant: ${variant.id}, assetId: ${variant.muxVideo.assetId}, status: ${muxVideoAsset.status}, hasPlaybackId: ${!!muxVideoAsset.playback_ids?.[0].id}, downloadsReady: ${downloadsReadyToStore(muxVideoAsset)}`
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
    const remainingSampleSize = sampleSize == null ? null : sampleSize - totalProcessed
    if (remainingSampleSize != null && remainingSampleSize <= 0) {
      break
    }

    const take = remainingSampleSize == null ? 500 : Math.max(100, remainingSampleSize * 5)
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

    const downloadsWithCarryover = [...carryoverDownloads, ...zeroMetadataDownloads]
    carryoverDownloads = []

    let completeDownloads = downloadsWithCarryover
    const lastDownload = downloadsWithCarryover.at(-1)
    if (zeroMetadataDownloads.length === take && lastDownload?.videoVariantId != null) {
      let trailingIndex = downloadsWithCarryover.length - 1
      while (
        trailingIndex >= 0 &&
        downloadsWithCarryover[trailingIndex]?.videoVariantId === lastDownload.videoVariantId
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
        (variant): variant is Prisma.VideoVariantGetPayload<{
          include: {
            muxVideo: true
          }
        }> => variant != null
      )

    const variantsToProcess =
      remainingSampleSize == null ? variants : variants.slice(0, remainingSampleSize)

    console.log(
      `Found ${variantsToProcess.length} variants with zero-metadata download rows to process in this batch`
    )

    for (const variant of variantsToProcess) {
      const variantZeroMetadataDownloads = downloadsByVariant.get(variant.id) ?? []
      await processVariant(variant, variantZeroMetadataDownloads)
      totalProcessed++
    }

    nextCursor = zeroMetadataDownloads.at(-1)?.id ?? null

    if (zeroMetadataDownloads.length < take || nextCursor == null) {
      hasMore = false
    }
  }

  if (carryoverDownloads.length > 0 && (sampleSize == null || totalProcessed < sampleSize)) {
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
