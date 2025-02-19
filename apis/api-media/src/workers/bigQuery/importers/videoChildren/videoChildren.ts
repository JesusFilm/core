import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { getVideoIds } from '../videos'

export async function importVideoChildren(logger?: Logger): Promise<void> {
  logger?.info('video children import started')

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
              .filter((id) => getVideoIds().includes(id))
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
