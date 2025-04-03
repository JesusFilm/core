import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { getTranslationText, processFile } from '../../importer'
import { TranslationData } from '../../types'
import {
  clearVideoCache,
  getFullVideoId,
  initializeVideoCache,
  isValidVideoId
} from '../../utils/videoCache'

const missingVideos = new Set<string>()

function validateVideoTitleData(data: TranslationData): boolean {
  const crowdinId = data.sourceString.identifier
  if (!crowdinId || !isValidVideoId(crowdinId)) {
    if (crowdinId) {
      missingVideos.add(crowdinId)
    }
    return false
  }
  const databaseId = getFullVideoId(crowdinId)
  if (!databaseId) {
    if (crowdinId) {
      missingVideos.add(crowdinId)
    }
    return false
  }
  return true
}

async function upsertVideoTitleTranslation(
  data: TranslationData
): Promise<void> {
  // Log missing videos summary when we're done processing
  if (missingVideos.size > 0) {
    console.warn('Videos do not exist in database', {
      count: missingVideos.size,
      videos: Array.from(missingVideos)
    })
    missingVideos.clear()
  }

  const text = getTranslationText(data.translation)
  if (!text) return

  const languageId =
    CROWDIN_CONFIG.languageCodes[
      data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
    ]
  if (!languageId) return

  const crowdinId = data.sourceString.identifier
  const databaseId = getFullVideoId(crowdinId)
  if (!databaseId) return

  await prisma.videoTitle.upsert({
    where: {
      videoId_languageId: {
        videoId: databaseId,
        languageId
      }
    },
    update: {
      value: text
    },
    create: {
      videoId: databaseId,
      languageId,
      value: text,
      primary: false
    }
  })
}

export async function importVideoTitles(
  sourceStringsApi: SourceStrings,
  stringTranslationsApi: StringTranslations,
  logger?: Logger
): Promise<() => void> {
  await initializeVideoCache(logger)

  await processFile(
    CROWDIN_CONFIG.files.media_metadata_tile,
    upsertVideoTitleTranslation,
    async (data) => {
      for (const item of data) {
        await upsertVideoTitleTranslation(item)
      }
    },
    {
      sourceStrings: sourceStringsApi,
      stringTranslations: stringTranslationsApi
    },
    logger
  )

  return () => clearVideoCache()
}
