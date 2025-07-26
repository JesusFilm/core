import Mux from '@mux/mux-node'

import {
  createDownloadsFromMuxAsset,
  downloadsReadyToStore
} from '../lib/downloads'
import { prisma } from '../lib/prisma'
import { getVideo } from '../schema/mux/video/service'

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

export async function createMuxAsset(
  url: string,
  mux: Mux,
  height: number
): Promise<string> {
  let maxResolutionTier: '1080p' | '1440p' | '2160p' = '1080p'
  if (height > 1080 && height <= 1440) {
    maxResolutionTier = '1440p'
  } else if (height > 1440) {
    maxResolutionTier = '2160p'
  }

  const muxVideo = await mux.video.assets.create({
    inputs: [
      {
        url: url
      }
    ],
    video_quality: 'plus',
    playback_policy: ['public'],
    max_resolution_tier: maxResolutionTier,
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
        // id: {
        //   not: { contains: '-jf61' }
        // },
        id: { startsWith: '4_' },
        video: {
          slug: { not: { startsWith: 'jesus/' } }
        },
        muxVideoId: null,
        // masterHeight: { not: null },
        masterUrl: { not: null },
        masterHeight: 2160
        // OR: [
        //   { masterHeight: { gt: 720 } },
        //   { video: { originId: { not: '1' } } }
        // ]
      },
      take
    })

    console.log(`Found ${variants.length} variants to import`)

    for (const variant of variants) {
      console.log(`Importing mux video for variant ${variant.id}`)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // wait 2 sec to avoid rate limit
      let muxVideoId: string | null = null
      try {
        muxVideoId = await createMuxAsset(
          variant.masterUrl as string,
          mux,
          variant.masterHeight as number
        )
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
        console.error(`Error retrieving mux upload for variant ${variant.id}`)
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

export async function processDownloads(mux: Mux): Promise<void> {
  console.log('mux downloads processing started')

  const take = 100
  let hasMore = true
  let totalProcessed = 0

  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        muxVideoId: { not: null },
        muxVideo: {
          downloadable: true,
          assetId: { not: null },
          readyToStream: true
        },
        OR: [
          {
            // Variants with no downloads at all (excluding distro downloads)
            downloads: {
              none: {
                quality: {
                  notIn: ['distroLow', 'distroSd', 'distroHigh']
                }
              }
            }
          },
          {
            // Variants with downloads that are not from Mux (non-Mux URLs)
            downloads: {
              some: {
                quality: {
                  notIn: ['distroLow', 'distroSd', 'distroHigh']
                },
                url: {
                  not: { startsWith: 'https://stream.mux.com' }
                }
              }
            }
          }
        ]
      },
      include: {
        muxVideo: true,
        downloads: {
          where: {
            // Include existing downloads that are NOT distro quality levels
            quality: {
              notIn: ['distroLow', 'distroSd', 'distroHigh']
            }
          }
        }
      },
      take
    })

    console.log(
      `Found ${variants.length} variants with downloadable Mux videos to process`
    )

    for (const variant of variants) {
      if (!variant.muxVideo?.assetId) {
        continue
      }

      console.log(`Processing downloads for variant ${variant.id}`)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // wait 1.5 sec to avoid rate limit

      try {
        const muxVideoAsset = await getVideo(variant.muxVideo.assetId, false)

        if (
          muxVideoAsset.status === 'ready' &&
          muxVideoAsset.playback_ids?.[0].id != null &&
          downloadsReadyToStore(muxVideoAsset)
        ) {
          // Delete existing non-distro downloads first
          if (variant.downloads.length > 0) {
            const downloadIds = variant.downloads.map((d) => d.id)
            await prisma.videoVariantDownload.deleteMany({
              where: {
                id: { in: downloadIds }
              }
            })

            console.log(
              `Deleted existing non-distro downloads for variant ${variant.id}, count: ${downloadIds.length}`
            )
          }

          // Process downloads if static renditions are ready
          const createdCount = await createDownloadsFromMuxAsset({
            variantId: variant.id,
            muxVideoAsset
          })

          console.log(
            `Successfully created ${createdCount} video downloads for variant ${variant.id}, muxVideoId: ${variant.muxVideo.id}`
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

    if (variants.length === 0) {
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
    const mux = getMuxClient()

    // Run all three processes in sequence
    await importMuxVideos(mux)
    await updateHls(mux)
    await processDownloads(mux)

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
