import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

let videoIds: string[] = []
let videos: Array<{ id: string }> = []

export function setValidVideoIds(
  videos: Array<{ id: string }>,
  logger?: Logger
): void {
  videoIds = videos.map(({ id }) => {
    const match = id.match(/_(.+)$/)
    if (match) {
      return match[1]
    }
    return id
  })
  logger?.info({ count: videos.length }, 'Initialized video cache')
}

export function isValidVideoId(crowdinId: string): boolean {
  return videoIds.includes(crowdinId)
}

export function getFullVideoId(crowdinId: string): string | undefined {
  const originalId = videos.find((v) => v.id === crowdinId)?.id
  if (originalId) return originalId

  const fullId = videos.find((v) => {
    const match = v.id.match(/_(.+)$/)
    return match && match[1] === crowdinId
  })?.id

  return fullId
}

export function resetVideoCache(): void {
  videoIds = []
  videos = []
}

const videoTitleSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageId: z.string()
  })
  .transform((data) => {
    const databaseId = getFullVideoId(data.identifier)
    if (!databaseId) {
      throw new Error('Invalid video ID')
    }

    return {
      videoId: databaseId,
      languageId: data.languageId,
      value: data.text,
      primary: false
    }
  })

export async function importVideoTitles(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'videoTitles' })
  logger?.info('Starting video titles import')

  videos = await prisma.video.findMany({
    select: { id: true }
  })
  setValidVideoIds(videos, logger)

  await processFile(
    CROWDIN_CONFIG.files.media_metadata_tile,
    async (data: ProcessedTranslation) => {
      await upsertVideoTitleTranslation(data)
    },
    logger
  )

  logger?.info('Finished video titles import')
  return () => {
    resetVideoCache()
  }
}

async function upsertVideoTitleTranslation(
  data: ProcessedTranslation
): Promise<void> {
  const result = videoTitleSchema.parse({
    identifier: data.identifier,
    text: data.text,
    languageId: data.languageId
  })

  await prisma.videoTitle.upsert({
    where: {
      videoId_languageId: {
        videoId: result.videoId,
        languageId: result.languageId
      }
    },
    update: result,
    create: result
  })
}
