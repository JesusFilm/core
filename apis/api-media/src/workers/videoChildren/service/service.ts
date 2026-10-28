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

  // A video is relevant if it currently declares children via childIds, or
  // if it still has stale children connected from a previous run whose
  // childIds has since shrunk to empty — both need their children relation
  // replaced to match childIds exactly.
  const videos = await prisma.video.findMany({
    select: { id: true, childIds: true },
    where: {
      OR: [{ childIds: { isEmpty: false } }, { children: { some: {} } }]
    }
  })
  for (const video of videos) {
    try {
      await prisma.video.update({
        where: { id: video.id },
        data: {
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
