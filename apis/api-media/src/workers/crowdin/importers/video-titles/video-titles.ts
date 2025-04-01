import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { ARCLIGHT_FILES } from '../../shared/arclight-files'
import {
  clearVideoCache,
  getFullVideoId,
  initializeVideoCache,
  isValidVideoId
} from '../../utils/video-cache'
import {
  BaseTranslation,
  CROWDIN_LANGUAGE_CODE_TO_ID,
  TranslationData
} from '../shared/base-translation'

export async function importVideoTitles(
  sourceStringsApi: SourceStrings,
  stringTranslationsApi: StringTranslations,
  logger?: Logger
): Promise<() => void> {
  await initializeVideoCache(logger)

  const translator = new VideoTitlesTranslator(
    sourceStringsApi,
    stringTranslationsApi,
    logger
  )
  const validateData = translator.validateData.bind(translator)
  const upsertTranslation = translator.upsertTranslation.bind(translator)

  await translator.processFile(
    ARCLIGHT_FILES.media_metadata_tile,
    validateData,
    upsertTranslation
  )

  return () => clearVideoCache()
}

class VideoTitlesTranslator extends BaseTranslation {
  private missingVideos = new Set<string>()

  validateData(data: TranslationData): boolean {
    const crowdinId = data.sourceString.identifier
    if (!crowdinId || !isValidVideoId(crowdinId)) {
      if (crowdinId) {
        this.missingVideos.add(crowdinId)
      }
      return false
    }
    const databaseId = getFullVideoId(crowdinId)
    if (!databaseId) {
      if (crowdinId) {
        this.missingVideos.add(crowdinId)
      }
      return false
    }
    return true
  }

  async upsertTranslation(data: TranslationData): Promise<void> {
    // Log missing videos summary when we're done processing
    if (this.missingVideos.size > 0) {
      this.logger?.warn(
        {
          count: this.missingVideos.size,
          videos: Array.from(this.missingVideos)
        },
        'Videos do not exist in database'
      )
      this.missingVideos.clear()
    }

    const text = this.getTranslationText(data.translation)
    if (!text) return

    const languageId =
      CROWDIN_LANGUAGE_CODE_TO_ID[
        data.languageCode as keyof typeof CROWDIN_LANGUAGE_CODE_TO_ID
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
}
