import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

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
          // `set`, not `connect`: this must exactly match the children
          // relation to the current childIds, including disconnecting any
          // id that was removed from childIds since the last run. `connect`
          // is additive-only and can never remove a stale edge, so a child
          // removed by any other write path would stay connected forever.
          children: {
            set: video.childIds
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
