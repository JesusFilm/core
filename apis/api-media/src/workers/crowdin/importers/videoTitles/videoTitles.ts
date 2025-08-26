import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma/media/client'

import {
  crowdinClient,
  crowdinProjectId
} from '../../../../lib/crowdin/crowdinClient'
import { CROWDIN_CONFIG, LANGUAGE_CODES } from '../../config'
import { ProcessedTranslation } from '../../types'

const videoTitleSchema = z.object({
  videoId: z.string(),
  value: z.string(),
  languageId: z.string(),
  primary: z.boolean()
})

interface VideoTitleRecord {
  videoId: string
  crowdinId: string
  existingTranslations: Map<string, string> // languageId -> current value
}

interface CrowdinTranslationBatch {
  stringId: number
  translations: Array<{
    languageId: string
    text: string
  }>
}

export async function importVideoTitles(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'videoTitles' })
  logger?.info('Starting video titles import')

  try {
    // Step 1: Get all videos that need translations from database
    const videoRecords = await getVideoTitleRecords(logger)
    logger?.info(
      `Found ${videoRecords.length} videos needing title translations`
    )

    if (videoRecords.length === 0) {
      logger?.info('No videos found needing title translations')
      return () => {
        // Cleanup function
      }
    }

    // Step 2: Get Crowdin string IDs for these videos
    const crowdinStringIdMap = await getCrowdinStringIds(videoRecords, logger)
    logger?.info(`Found ${crowdinStringIdMap.size} Crowdin string IDs`)

    if (crowdinStringIdMap.size === 0) {
      logger?.info('No Crowdin string IDs found')
      return () => {
        // Cleanup function
      }
    }

    // Step 3: Fetch translations for all languages in batches
    const translations = await fetchTranslationsForLanguages(
      Array.from(crowdinStringIdMap.values()),
      logger
    )
    logger?.info(`Fetched ${translations.length} translation batches`)

    // Step 4: Process and upsert translations
    await processAndUpsertTranslations(
      videoRecords,
      translations,
      crowdinStringIdMap,
      logger
    )

    logger?.info('Finished video titles import')
    return () => {
      // Cleanup function
    }
  } catch (error) {
    logger?.error('Video titles import failed:', error)
    throw error
  }
}

async function getVideoTitleRecords(
  logger?: Logger
): Promise<VideoTitleRecord[]> {
  // Get existing video titles with crowdInId to identify which videos need translations
  const existingTitles = await prisma.videoTitle.findMany({
    select: {
      videoId: true,
      crowdInId: true,
      languageId: true,
      value: true
    },
    where: {
      crowdInId: { not: null }
    }
  })

  // Group by videoId and crowdInId
  const videoMap = new Map<string, VideoTitleRecord>()

  existingTitles.forEach((title) => {
    if (!title.crowdInId) return

    if (!videoMap.has(title.videoId)) {
      videoMap.set(title.videoId, {
        videoId: title.videoId,
        crowdinId: title.crowdInId,
        existingTranslations: new Map()
      })
    }

    const record = videoMap.get(title.videoId)!
    record.existingTranslations.set(title.languageId, title.value)
  })

  return Array.from(videoMap.values())
}

async function getCrowdinStringIds(
  videoRecords: VideoTitleRecord[],
  logger?: Logger
): Promise<Map<string, number>> {
  const stringIdMap = new Map<string, number>()
  const errors: string[] = []

  try {
    // Get all source strings for the media metadata tile file
    const sourceStrings =
      await crowdinClient.sourceStringsApi.listProjectStrings(
        crowdinProjectId,
        {
          fileId: CROWDIN_CONFIG.files.media_metadata_tile.id,
          limit: 500,
          offset: 0
        }
      )

    // Create a map of identifier to string ID
    const identifierToIdMap = new Map<string, number>()
    sourceStrings.data.forEach((str) => {
      identifierToIdMap.set(str.data.identifier, str.data.id)
    })

    // Match crowdin IDs to string IDs
    for (const record of videoRecords) {
      const stringId = identifierToIdMap.get(record.crowdinId)
      if (stringId) {
        stringIdMap.set(record.crowdinId, stringId)
      } else {
        errors.push(
          `No source string found for crowdin ID: ${record.crowdinId}`
        )
      }
    }
  } catch (error) {
    logger?.error('Failed to fetch source strings:', error)
    errors.push(
      `Failed to fetch source strings: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  if (errors.length > 0) {
    logger?.warn('Some errors occurred while fetching string IDs:', errors)
  }

  return stringIdMap
}

async function fetchTranslationsForLanguages(
  stringIds: number[],
  logger?: Logger
): Promise<CrowdinTranslationBatch[]> {
  const batches: CrowdinTranslationBatch[] = []
  const errors: string[] = []

  // Process string IDs in batches
  const stringIdBatchSize = 100
  for (let i = 0; i < stringIds.length; i += stringIdBatchSize) {
    const stringIdBatch = stringIds.slice(i, i + stringIdBatchSize)

    for (const [languageCode, languageId] of Object.entries(LANGUAGE_CODES)) {
      try {
        const translations =
          await crowdinClient.stringTranslationsApi.listLanguageTranslations(
            crowdinProjectId,
            languageCode,
            {
              stringIds: stringIdBatch.join(','),
              limit: 500
            }
          )

        // Group translations by string ID
        const translationMap = new Map<
          number,
          Array<{ languageId: string; text: string }>
        >()

        translations.data.forEach((translation) => {
          const stringId = translation.data.stringId
          if (!translationMap.has(stringId)) {
            translationMap.set(stringId, [])
          }
          // Only include plain text translations
          if (translation.data.contentType === 'text/plain') {
            translationMap.get(stringId)!.push({
              languageId,
              text: (translation.data as any).text || ''
            })
          }
        })

        // Add to batches
        translationMap.forEach((translations, stringId) => {
          batches.push({
            stringId,
            translations
          })
        })
      } catch (error) {
        const errorMsg = `Failed to fetch translations for language ${languageCode}: ${error instanceof Error ? error.message : 'Unknown error'}`
        logger?.error(errorMsg, error)
        errors.push(errorMsg)
      }
    }
  }

  if (errors.length > 0) {
    logger?.warn('Some errors occurred while fetching translations:', errors)
  }

  return batches
}

async function processAndUpsertTranslations(
  videoRecords: VideoTitleRecord[],
  translationBatches: CrowdinTranslationBatch[],
  crowdinStringIdMap: Map<string, number>,
  logger?: Logger
): Promise<void> {
  const videoMap = new Map<string, VideoTitleRecord>()
  videoRecords.forEach((record) => {
    videoMap.set(record.crowdinId, record)
  })

  let updatedCount = 0
  let createdCount = 0
  let skippedCount = 0
  const errors: string[] = []

  for (const batch of translationBatches) {
    for (const translation of batch.translations) {
      try {
        // Find the video record for this string ID by looking up the crowdin ID
        let videoRecord: VideoTitleRecord | undefined
        for (const [crowdinId, stringId] of crowdinStringIdMap.entries()) {
          if (stringId === batch.stringId) {
            videoRecord = videoMap.get(crowdinId)
            break
          }
        }

        if (!videoRecord) {
          skippedCount++
          continue
        }

        // Check if translation is different from existing
        const existingValue = videoRecord.existingTranslations.get(
          translation.languageId
        )
        if (existingValue === translation.text) {
          skippedCount++
          continue
        }

        const result = videoTitleSchema.parse({
          videoId: videoRecord.videoId,
          value: translation.text,
          languageId: translation.languageId,
          primary: false
        })

        await prisma.videoTitle.upsert({
          where: {
            videoId_languageId: {
              videoId: videoRecord.videoId,
              languageId: translation.languageId
            }
          },
          update: result,
          create: result
        })

        if (existingValue) {
          updatedCount++
        } else {
          createdCount++
        }
      } catch (error) {
        const errorMsg = `Failed to upsert translation for string ${batch.stringId} in language ${translation.languageId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        logger?.error(errorMsg, error)
        errors.push(errorMsg)
      }
    }
  }

  logger?.info(
    {
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.length
    },
    'Translation processing completed'
  )

  if (errors.length > 0) {
    logger?.warn('Some errors occurred during translation processing:', errors)
  }
}
