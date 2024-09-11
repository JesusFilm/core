import fetch from 'cross-fetch'
import { Logger } from 'pino'

import { ImageAspectRatio } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'
import { createImageFromUrl } from '../../../../schema/cloudflare/image/service'
import { client, getCurrentTimeStamp } from '../../importer'

const table = 'jfp-data-warehouse.jfp_mmdb_prod.core_cloudflare_image_data'

export async function imageSeed(logger?: Logger): Promise<void> {
  logger?.info('imageSeed started')
  const updateTime = await getCurrentTimeStamp()
  const newVideos = await prisma.video.findMany({
    select: { id: true },
    where: { images: { none: {} } }
  })

  for (const video of newVideos) {
    const url1 = `https://d1wl257kev7hsz.cloudfront.net/cinematics/${video.id}.mobileCinematicHigh.jpg`
    const url2 = `https://d1wl257kev7hsz.cloudfront.net/cinematics/${video.id}.videoStill.jpg`
    let exists = true
    try {
      const exists1 = await fetch(url1, { method: 'HEAD' })
      exists = exists1.status === 200
      if (!exists)
        throw new Error(
          `Could not find ${url1} on AWS. Please check the video ID: ${video.id}`
        )
      const exists2 = await fetch(url2, { method: 'HEAD' })
      exists = exists2.status === 200
      if (!exists)
        throw new Error(
          `Could not find ${url2} on AWS. Please check the video ID: ${video.id}`
        )

      const { id: cloudflareId1 } = await createImageFromUrl(url1)
      const { id: cloudflareId2 } = await createImageFromUrl(url2)

      const insert1 = `INSERT INTO "${table}" (id, aspectRatio, videoId, uploadUrl, updatedAt) VALUES ('${cloudflareId1}', '${ImageAspectRatio.banner}', '${video.id}', '${url1}', '${updateTime}')`
      await client.query(insert1)
      const insert2 = `INSERT INTO "${table}" (id, aspectRatio, videoId, uploadUrl, updatedAt) VALUES ('${cloudflareId2}', '${ImageAspectRatio.hd}', '${video.id}', '${url2}', '${updateTime}')`
      await client.query(insert2)
    } catch (e) {
      logger?.info(e)
    }
    logger?.info('imageSeed finished')
  }
}
