import { Logger } from 'pino'

import { ImageAspectRatio } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'
import { getClient } from '../../../../schema/cloudflare/image/service'

export async function importVideoImages(logger?: Logger): Promise<void> {
  logger?.info('imageSeed started')
  const newVideos = await prisma.video.findMany({
    select: { id: true },
    where: { images: { none: {} } }
  })

  if (newVideos.length === 0) {
    logger?.info('imageSeed finished')
    return
  }

  const client = getClient()
  for (const video of newVideos) {
    logger?.info(`imageSeed started for video: ${video.id}`)
    const editions = [
      {
        fileName: `${video.id}.mobileCinematicHigh.jpg`,
        aspectRatio: ImageAspectRatio.banner
      },
      {
        fileName: `${video.id}.videoStill.jpg`,
        aspectRatio: ImageAspectRatio.hd
      }
    ]
    for (const edition of editions) {
      try {
        const url = `https://d1wl257kev7hsz.cloudfront.net/cinematics/${edition.fileName}`
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
