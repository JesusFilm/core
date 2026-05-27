import Mux from '@mux/mux-node'

import {
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

  const dryRun = process.env.MUX_DOWNLOAD_BACKFILL_DRY_RUN === 'true'
  const dryRunPreview = process.env.MUX_DOWNLOAD_BACKFILL_PREVIEW_VALUES === 'true'
  const target = process.env.MUX_DOWNLOAD_BACKFILL_TARGET?.trim()
  const targetFilter =
    target != null && target !== ''
      ? {
          OR: [
            { id: { contains: target } },
            { videoId: { contains: target } },
            { slug: { contains: target } },
            { video: { slug: { contains: target } } }
          ]
        }
      : undefined

  if (targetFilter != null) {
    console.log(`Filtering download processing to target: ${target}`)
  }
  if (dryRun) {
    console.log('Dry run enabled: no download rows will be created or refreshed')
  }
  if (dryRunPreview) {
    console.log('Dry run preview enabled: will fetch Mux metadata and print replacement values')
  }

  const take = 100
  let hasMore = true
  let totalProcessed = 0
  // Track variants already attempted this run so a variant whose Mux
  // metadata is still incomplete after processing isn't re-selected forever
  // by the same query - it remains eligible for the next script run instead.
  const attemptedVariantIds: string[] = []

  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        id: { notIn: attemptedVariantIds },
        muxVideoId: { not: null },
        muxVideo: {
          downloadable: true,
          assetId: { not: null },
          readyToStream: true
        },
        AND: [
          ...(targetFilter != null ? [targetFilter] : []),
          {
            // Existing standard Mux downloads with missing metadata need refresh/backfill.
            downloads: {
              some: {
                quality: {
                  notIn: DISTRO_DOWNLOAD_QUALITIES
                },
                url: { startsWith: MUX_STREAM_BASE_URL },
                OR: [
                  { size: null },
                  { size: 0 },
                  { bitrate: null },
                  { bitrate: 0 }
                ]
              }
            }
          },
          {
            // Variants with Mux downloads persisted with a zero size or
            // bitrate (see VMT-239) - re-fetch from Mux in case the metadata
            // has since propagated
            downloads: {
              some: {
                quality: {
                  notIn: ['distroLow', 'distroSd', 'distroHigh']
                },
                url: {
                  startsWith: 'https://stream.mux.com'
                },
                OR: [{ size: 0 }, { bitrate: 0 }]
              }
            }
          }
        ]
      },
      include: {
        muxVideo: true,
        downloads: {
          where: {
            quality: {
              notIn: DISTRO_DOWNLOAD_QUALITIES
            },
            url: { startsWith: MUX_STREAM_BASE_URL },
            OR: [
              { size: null },
              { size: 0 },
              { bitrate: null },
              { bitrate: 0 }
            ]
          }
        }
      },
      take
    })

    console.log(
      `Found ${variants.length} variants with downloadable Mux videos to process`
    )

    for (const variant of variants) {
      attemptedVariantIds.push(variant.id)

      if (!variant.muxVideo?.assetId) {
        continue
      }

      const zeroMetadataDownloads = variant.downloads
      console.log(
        `Processing downloads for variant ${variant.id}, zero-metadata Mux download count: ${zeroMetadataDownloads.length}`
      )

      if (dryRun && !dryRunPreview) {
        console.log(
          `Dry run: would refresh zero-metadata Mux downloads for variant ${variant.id}, count: ${zeroMetadataDownloads.length}`
        )
        totalProcessed++
        continue
      }

      await new Promise((resolve) => setTimeout(resolve, 1500)) // wait 1.5 sec to avoid rate limit

      try {
        const muxVideoAsset = await getVideo(variant.muxVideo.assetId, false)

        if (
          muxVideoAsset.status === 'ready' &&
          muxVideoAsset.playback_ids?.[0].id != null &&
          downloadsReadyToStore(muxVideoAsset)
        ) {
          if (dryRunPreview) {
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
              `Dry run preview for variant ${variant.id}, muxVideoId: ${variant.muxVideo.id}`
            )
            for (const download of zeroMetadataDownloads) {
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
            totalProcessed++
            continue
          }

          // Process downloads if static renditions are ready. Existing valid and distro rows are preserved.
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

      totalProcessed++
    }

    if (variants.length === 0 || dryRun) {
      hasMore = false
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
