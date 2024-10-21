import { Logger } from 'pino'

import { ImageAspectRatio } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'
import { getClient } from '../../../../schema/cloudflare/image/service'
import { client as bqClient } from '../../importer'

enum fields {
  videoStill = 'videoStill',
  mobileCinematicHigh = 'mobileCinematicHigh'
}

export async function importVideoImages(logger?: Logger): Promise<void> {
  logger?.info('imageSeed started')
  const brokenVideos = await prisma.video.findMany({
    select: { id: true },
    where: {
      images: { none: {} }
    }
  })
  if (brokenVideos.length > 0)
    logger?.info(`found ${brokenVideos.length} broken video images`)
  else {
    logger?.info('imageSeed finished')
    return
  }

  const client = getClient()
  for (const video of brokenVideos) {
    const bqResult = await bqClient.query({
      query: `SELECT * FROM \`jfp-data-warehouse.jfp_mmdb_prod.core_video_arclight_data\` WHERE id = @id`,
      params: {
        id: video.id
      },
      location: 'US'
    })
    const bqVideo = bqResult[0][0]
    if (bqVideo?.mobileCinematicHigh == null) {
      logger?.info(`video ${video.id} has no image in bigquery`)
      continue
    }

    const editions = [
      {
        fileName: `${video.id}.mobileCinematicHigh.jpg`,
        field: fields.mobileCinematicHigh,
        aspectRatio: ImageAspectRatio.banner
      },
      {
        fileName: `${video.id}.videoStill.jpg`,
        field: fields.videoStill,
        aspectRatio: ImageAspectRatio.hd
      }
    ]

    for (const edition of editions) {
      try {
        const url =
          bqVideo[edition.field] ??
          `https://d1wl257kev7hsz.cloudfront.net/cinematics/${edition.fileName}`
        // skip image check and upload in dev
        if (['production', 'test'].includes(process.env.NODE_ENV as string)) {
          try {
            await client.images.v1.get(edition.fileName, {
              account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
            })
          } catch {
            await client.images.v1.create(
              {
                account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
              },
              {
                body: {
                  id: edition.fileName,
                  url
                }
              }
            )
          }
        }
        await prisma.cloudflareImage.create({
          data: {
            id: edition.fileName,
            aspectRatio: edition.aspectRatio,
            videoId: video.id,
            uploadUrl: url,
            userId: 'system'
          }
        })
      } catch (e) {
        logger?.info(e)
      }
    }
  }
  logger?.info('imageSeed finished')
}
