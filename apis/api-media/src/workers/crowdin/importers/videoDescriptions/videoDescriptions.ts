import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'
import {
  getFullVideoId,
  resetVideoCache,
  setValidVideoIds
} from '../videoTitles/videoTitles'

const videoDescriptionSchema = z
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

export async function importVideoDescriptions(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'videoDescriptions' })
  logger?.info('Starting video descriptions import')

  const videos = await prisma.video.findMany({
    select: { id: true }
  })
  setValidVideoIds(videos, logger)

  await processFile(
    CROWDIN_CONFIG.files.media_metadata_description,
    async (data: ProcessedTranslation) => {
      await upsertVideoDescriptionTranslation(data)
    },
    logger
  )

  logger?.info('Finished video descriptions import')
  return () => {
    resetVideoCache()
  }
}

async function upsertVideoDescriptionTranslation(
  data: ProcessedTranslation
): Promise<void> {
  const result = videoDescriptionSchema.parse({
    identifier: data.identifier,
    text: data.text,
    languageId: data.languageId
  })

  await prisma.videoDescription.upsert({
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
