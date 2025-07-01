import Mux from '@mux/mux-node'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

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
    max_resolution_tier: maxResolutionTier
  })
  return muxVideo.id
}

export async function importMuxVideos(
  mux: Mux,
  logger?: Logger
): Promise<void> {
  logger?.info('mux videos import started')

  let totalImported = 0
  const take = 100
  let hasMore = true
  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        // id: '2_20528-0-PaperHats',
        muxVideoId: null,
        masterHeight: { not: null },
        masterUrl: { not: null },
        OR: [
          { masterHeight: { gt: 720 } },
          { video: { originId: { not: '1' } } }
        ]
      },
      take
    })

    logger?.info(`Found ${variants.length} variants to import`)

    for (const variant of variants) {
      logger?.info(`Importing mux video for variant ${variant.id}`)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // wait 1.5 sec to avoid rate limit
      let muxVideoId: string | null = null
      try {
        muxVideoId = await createMuxAsset(
          variant.masterUrl as string,
          mux,
          variant.masterHeight as number
        )
      } catch (error) {
        if (error instanceof Error) {
          logger?.error(
            `Error creating mux asset for variant ${variant.id}: ${error.message}`
          )
        } else {
          logger?.error(`Error creating mux asset for variant ${variant.id}`)
        }
        continue
      }

      try {
        await prisma.$transaction(async (tx) => {
          await tx.muxVideo.create({
            data: {
              assetId: muxVideoId,
              userId: 'system'
            }
          })
          await tx.videoVariant.update({
            where: {
              id: variant.id
            },
            data: {
              muxVideoId: muxVideoId
            }
          })
        })
      } catch (error) {
        if (error instanceof Error) {
          logger?.error(
            `Error updating video variant ${variant.id}: ${error.message}`
          )
        } else {
          logger?.error(`Error updating video variant ${variant.id}`)
        }
      }

      totalImported++
    }

    if (variants.length === 0) {
      hasMore = false
    }
  }

  logger?.info(`Imported ${totalImported} mux videos`)
}

export async function updateHls(mux: Mux, logger?: Logger): Promise<void> {
  logger?.info('mux videos update started')

  const take = 100
  let hasMore = true
  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
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

    logger?.info(`Found ${variants.length} variants to update`)

    for (const variant of variants) {
      logger?.info(`Attempting to update hls for variant ${variant.id}`)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // wait 1.5 sec to avoid rate limit

      let muxVideo: Mux.Video.Asset | null = null
      try {
        muxVideo = await mux.video.assets.retrieve(
          variant.muxVideo?.assetId as string
        )
      } catch (error) {
        logger?.error(`Error retrieving mux upload for variant ${variant.id}`)
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
              hls: `https://stream.mux.com/${playbackId}`,
              muxVideo: {
                update: {
                  playbackId
                }
              }
            }
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          logger?.error(
            `Error updating video variant ${variant.id}: ${error.message}`
          )
        } else {
          logger?.error(`Error updating video variant ${variant.id}`)
        }
      }
    }

    if (variants.length === 0) {
      hasMore = false
    }
  }
}

export async function service(logger?: Logger): Promise<void> {
  const mux = getMuxClient()
  await importMuxVideos(mux, logger)
  await updateHls(mux, logger)
}
