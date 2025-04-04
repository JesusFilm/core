import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { TranslationData } from '../../types'
import { getFullVideoId, setValidVideoIds } from '../videoTitles/videoTitles'

const videoDescriptionSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageCode: z.string()
  })
  .transform((data) => {
    const databaseId = getFullVideoId(data.identifier)
    if (!databaseId) {
      missingVideos.add(data.identifier)
      throw new Error('Invalid video ID')
    }

    return {
      videoId: databaseId,
      languageId: data.languageCode,
      value: data.text,
      primary: false
    }
  })

const missingVideos = new Set<string>()

export async function importVideoDescriptions(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'videoDescriptions' })
  logger?.info('Starting video descriptions import')

  // Initialize video IDs first
  const videos = await prisma.video.findMany({
    select: { id: true }
  })
  setValidVideoIds(videos, logger)

  await processFile(
    CROWDIN_CONFIG.files.media_metadata_description,
    async (data: TranslationData) => {
      await upsertVideoDescriptionTranslation(data)
    },
    logger
  )

  if (missingVideos.size > 0) {
    logger?.warn(
      {
        count: missingVideos.size,
        videos: Array.from(missingVideos)
      },
      'Videos not found in database'
    )
  }

  logger?.info('Finished video descriptions import')
  return () => missingVideos.clear()
}

async function upsertVideoDescriptionTranslation(
  data: TranslationData
): Promise<void> {
  const result = videoDescriptionSchema.parse({
    identifier: data.sourceString.identifier,
    text: data.translation.text,
    languageCode:
      CROWDIN_CONFIG.languageCodes[
        data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
      ]
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
