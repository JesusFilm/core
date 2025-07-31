import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

async function getPublishedVideosWithoutPublishedAt(): Promise<
  Array<{ id: string }>
> {
  const videos = await prisma.video.findMany({
    select: { id: true },
    where: {
      published: true,
      publishedAt: null
    }
  })
  return videos
}

export async function service(logger?: Logger): Promise<void> {
  logger?.info('published videos publishedAt update started')

  const videos = await getPublishedVideosWithoutPublishedAt()

  if (videos.length === 0) {
    logger?.info('no published videos without publishedAt found')
    return
  }

  logger?.info(`found ${videos.length} published videos without publishedAt`)

  const batchSize = 100
  const batches = []

  for (let i = 0; i < videos.length; i += batchSize) {
    batches.push(videos.slice(i, i + batchSize))
  }

  let processedCount = 0
  const publishedAtTimestamp = new Date()

  for (const batch of batches) {
    try {
      await prisma.$transaction(
        batch.map((video) =>
          prisma.video.update({
            where: { id: video.id },
            data: {
              publishedAt: publishedAtTimestamp
            }
          })
        )
      )
      processedCount += batch.length
      logger?.info(`processed ${processedCount}/${videos.length} videos`)
    } catch (error) {
      logger?.error(
        { error, batchSize: batch.length },
        'failed to update batch'
      )
    }
  }

  logger?.info(
    `published videos publishedAt update finished - updated ${processedCount} videos`
  )
}
