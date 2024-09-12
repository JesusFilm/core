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
  const video = newVideos[0]
  // for (const video of newVideos) {
  const fileNames = [
    `${video.id}.mobileCinematicHigh.jpg`,
    `${video.id}.videoStill.jpg`
  ]
  for (const fileName of fileNames) {
    try {
      const url = `https://d1wl257kev7hsz.cloudfront.net/cinematics/${fileName}`
      try {
        await client.images.v1.get(fileName, {
          account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
        })
      } catch {
        await client.images.v1.create(
          {
            account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
          },
          {
            body: {
              id: fileName,
              url
            }
          }
        )
      }
      await prisma.cloudflareImage.create({
        data: {
          id: fileName,
          aspectRatio: ImageAspectRatio.banner,
          videoId: video.id,
          uploadUrl: url,
          userId: 'system'
        }
      })
    } catch (e) {
      logger?.info(e)
    }
  }
  logger?.info('imageSeed finished')
}
