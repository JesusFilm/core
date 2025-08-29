import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma/media/client'

import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'
import { getFullVideoId, resetVideoCache } from '../videoTitles/videoTitles'

const videoDescriptionSchema = z.object({
  videoId: z.string(),
  value: z.string(),
  languageId: z.string(),
  primary: z.boolean()
})

export async function importVideoDescriptions(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'videoDescriptions' })
  logger?.info('Starting video descriptions import')

  // Process media metadata descriptions
  await processFile(
    CROWDIN_CONFIG.files.media_metadata_description,
    async (data: ProcessedTranslation) => {
      await upsertVideoDescriptionTranslation(data, logger)
    },
    logger
  )

  // Process collection descriptions
  await processFile(
    CROWDIN_CONFIG.files.collection_long_description,
    async (data: ProcessedTranslation) => {
      await upsertVideoDescriptionTranslation(data, logger)
    },
    logger
  )

  logger?.info('Finished video descriptions import')
  return () => {
    resetVideoCache()
  }
}

async function upsertVideoDescriptionTranslation(
  data: ProcessedTranslation,
  logger?: Logger
): Promise<void> {
  try {
    const databaseId = getFullVideoId(data.identifier)
    if (!databaseId) {
      logger?.debug(
        `Skipping video description - Invalid ID: ${data.identifier}`
      )
      return
    }

    const result = videoDescriptionSchema.parse({
      videoId: databaseId,
      value: data.text,
      languageId: data.languageId,
      primary: false
    })

    await prisma.videoDescription.upsert({
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
      `Failed to upsert video description for video ${data.identifier} in language ${data.languageId}:`,
      error
    )
  }
}
