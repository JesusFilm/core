import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

let videos: Array<{ id: string }> = []

const videoTitleSchema = z.object({
  videoId: z.string(),
  value: z.string(),
  languageId: z.string(),
  primary: z.boolean()
})

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
  videos = []
}

export async function importVideoTitles(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'videoTitles' })
  logger?.info('Starting video titles import')

  try {
    videos = await prisma.video.findMany({
      select: { id: true }
    })
    logger?.info(`Loaded ${videos.length} videos from database`)
  } catch (error) {
    logger?.error('Failed to fetch videos from database:', error)
    throw new Error('Video import failed: Unable to load video data')
  }

  // Process media metadata titles
  await processFile(
    CROWDIN_CONFIG.files.media_metadata_tile,
    async (data: ProcessedTranslation) => {
      await upsertVideoTitleTranslation(data, logger)
    },
    logger
  )

  // Process collection titles
  await processFile(
    CROWDIN_CONFIG.files.collection_title,
    async (data: ProcessedTranslation) => {
      await upsertVideoTitleTranslation(data, logger)
    },
    logger
  )

  logger?.info('Finished video titles import')
  return () => {
    resetVideoCache()
  }
}

async function upsertVideoTitleTranslation(
  data: ProcessedTranslation,
  logger?: Logger
): Promise<void> {
  try {
    const databaseId = getFullVideoId(data.identifier)
    if (!databaseId) {
      logger?.debug(`Skipping video title - Invalid ID: ${data.identifier}`)
      return
    }

    const result = videoTitleSchema.parse({
      videoId: databaseId,
      value: data.text,
      languageId: data.languageId,
      primary: false
    })

    await prisma.videoTitle.upsert({
      where: {
        videoId_languageId: {
          videoId: databaseId,
          languageId: data.languageId
        }
      },
      update: result,
      create: result
    })
  } catch (error) {
    logger?.error(
      `Failed to upsert video title for video ${data.identifier} in language ${data.languageId}:`,
      error
    )
  }
}
