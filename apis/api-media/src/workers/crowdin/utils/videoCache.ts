import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

// Cache for video IDs to avoid repeated database queries
const videoIdMap = new Map<string, string>()

export function setValidVideoIds(videos: Array<{ id: string }>): void {
  videoIdMap.clear()
  for (const { id } of videos) {
    videoIdMap.set(id, id)
    const match = id.match(/^\d+_(.+)$/)
    if (match) {
      const idWithoutSourceCode = match[1]
      if (!videoIdMap.has(idWithoutSourceCode)) {
        videoIdMap.set(idWithoutSourceCode, id)
      }
    }
  }
}

export function isValidVideoId(crowdinId: string): boolean {
  return videoIdMap.has(crowdinId)
}

export function getFullVideoId(crowdinId: string): string | undefined {
  return videoIdMap.get(crowdinId)
}

export async function initializeVideoCache(logger?: Logger): Promise<void> {
  const videos = await prisma.video.findMany({
    select: { id: true }
  })
  setValidVideoIds(videos)
  logger?.info({ count: videos.length }, 'Found existing videos')
}

export function clearVideoCache(): void {
  videoIdMap.clear()
}
