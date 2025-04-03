import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { TranslationData } from '../../types'
import { getFullVideoId, isValidVideoId } from '../../utils/videoCache'

const videoTitleSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageCode: z.string()
  })
  .transform((data) => {
    const databaseId = getFullVideoId(data.identifier)
    if (!databaseId) throw new Error('Invalid video ID')

    return {
      videoId: databaseId,
      languageId: data.languageCode,
      value: data.text,
      primary: false
    }
  })

const missingVideos = new Set<string>()

function validateVideoTitleData(data: TranslationData): boolean {
  const identifier = data.sourceString.identifier
  if (!identifier || !isValidVideoId(identifier)) {
    if (identifier) {
      missingVideos.add(identifier)
    }
    return false
  }

  if (!data.translation.text) {
    return false
  }

  const languageId =
    CROWDIN_CONFIG.languageCodes[
      data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
    ]
  if (!languageId) {
    return false
  }

  const databaseId = getFullVideoId(identifier)
  if (!databaseId) {
    if (identifier) {
      missingVideos.add(identifier)
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

  if (!validateVideoTitleData(data)) return

  const result = videoTitleSchema.parse({
    identifier: data.sourceString.identifier,
    text: data.translation.text,
    languageCode:
      CROWDIN_CONFIG.languageCodes[
        data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
      ]
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

export async function importVideoTitles(): Promise<void> {
  await processFile(
    CROWDIN_CONFIG.files.media_metadata_tile,
    upsertVideoTitleTranslation
  )
}
