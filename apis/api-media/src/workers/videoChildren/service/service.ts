import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

async function getVideoIds(): Promise<string[]> {
  const videos = await prisma.video.findMany({
    select: { id: true }
  })
  return videos.map((video) => video.id)
}

export async function service(logger?: Logger): Promise<void> {
  logger?.info('video children import started')

  const videoIds = await getVideoIds()

  if (videoIds.length === 0) {
    logger?.info('no video ids found')
    return
  }

  const children = await prisma.video.findMany({
    select: { id: true, childIds: true },
    where: { childIds: { isEmpty: false } }
  })
  for (const video of children) {
    try {
      await prisma.video.update({
        where: { id: video.id },
        data: {
          children: {
            connect: video.childIds
              .filter((id) => videoIds.includes(id))
              .map((id) => ({ id }))
          }
        }
      })
    } catch (error) {
      logger?.error(error)
    }
  }

  logger?.info('video children import finished')
}
