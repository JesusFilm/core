import { Logger } from 'pino'

import { prisma } from '../../../../../../../libs/prisma/media/src/client'

import {
  crowdinClient,
  crowdinProjectId
} from '../../../../lib/crowdin/crowdinClient'
import { CROWDIN_CONFIG, LANGUAGE_CODES } from '../../config'

const languageIds: Record<number, string> = {
  16639: 'Indonesian (Yesus)',
  6788: 'Farsi, Western',
  1942: 'Turkish',
  13169: 'Thai',
  3804: 'Korean',
  22658: 'Arabic, Modern Standard',
  496: 'French',
  529: 'English',
  21753: 'Chinese, Traditional',
  6464: 'Hindi',
  7083: 'Japanese',
  21028: 'Spanish, Latin American',
  3887: 'Vietnamese',
  407: 'Urdu',
  3934: 'Russian',
  1106: 'German, Standard',
  176243: 'Bangla',
  584: 'Portuguese, Brazil',
  6930: 'Hebrew',
  21754: 'Chinese, Simplified'
}

interface MissingTranslation {
  videoId: string
  type: 'title' | 'description' | 'studyQuestion'
  languageId: string
  order?: number
  crowdInId?: string
}

export async function runCrowdinIdOperation(logger?: Logger): Promise<void> {
  logger?.info('Starting to find and upsert missing translations')

  // Find all videos with their existing translations
  const allVideos = await prisma.video.findMany({
    include: {
      title: {
        select: {
          languageId: true,
          crowdInId: true
        }
      },
      description: {
        select: {
          languageId: true,
          crowdInId: true
        }
      },
      studyQuestions: {
        select: {
          languageId: true,
          order: true,
          crowdInId: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  logger?.info(`Found ${allVideos.length} videos to process`)

  // Find missing translations
  const missingTranslations: MissingTranslation[] = []

  for (const video of allVideos) {
    const existingTitleLanguages = new Set(video.title.map((t) => t.languageId))
    const existingDescLanguages = new Set(
      video.description.map((d) => d.languageId)
    )

    const studyQuestionsByOrder = video.studyQuestions.reduce(
      (acc, sq) => {
        if (!acc[sq.order]) acc[sq.order] = new Set()
        acc[sq.order].add(sq.languageId)
        return acc
      },
      {} as Record<number, Set<string>>
    )

    // Check for missing titles
    for (const languageId of Object.values(languageIds)) {
      if (!existingTitleLanguages.has(languageId)) {
        const existingTitle = video.title.find((t) => t.crowdInId)
        missingTranslations.push({
          videoId: video.id,
          type: 'title',
          languageId,
          crowdInId: existingTitle?.crowdInId || undefined
        })
      }
    }

    // Check for missing descriptions
    for (const languageId of Object.values(languageIds)) {
      if (!existingDescLanguages.has(languageId)) {
        const existingDesc = video.description.find((d) => d.crowdInId)
        missingTranslations.push({
          videoId: video.id,
          type: 'description',
          languageId,
          crowdInId: existingDesc?.crowdInId || undefined
        })
      }
    }

    // Check for missing study questions (orders 1-7)
    for (let order = 1; order <= 7; order++) {
      const existingLanguages = studyQuestionsByOrder[order] || new Set()
      for (const languageId of Object.values(languageIds)) {
        if (!existingLanguages.has(languageId)) {
          const existingStudyQ = video.studyQuestions.find(
            (sq) => sq.order === order && sq.crowdInId
          )
          missingTranslations.push({
            videoId: video.id,
            type: 'studyQuestion',
            languageId,
            order,
            crowdInId: existingStudyQ?.crowdInId || undefined
          })
        }
      }
    }
  }

  logger?.info(`Found ${missingTranslations.length} missing translations`)

  // Process missing translations in batches
  const batchSize = 50
  let processedCount = 0

  for (let i = 0; i < missingTranslations.length; i += batchSize) {
    const batch = missingTranslations.slice(i, i + batchSize)

    for (const missingTranslation of batch) {
      try {
        await processMissingTranslation(missingTranslation, logger)
        processedCount++

        if (processedCount % 100 === 0) {
          logger?.info(
            `Processed ${processedCount}/${missingTranslations.length} translations`
          )
        }
      } catch (error) {
        logger?.error(`Failed to process translation:`, {
          videoId: missingTranslation.videoId,
          type: missingTranslation.type,
          languageId: missingTranslation.languageId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  logger?.info(`Completed processing ${processedCount} translations`)
}

async function processMissingTranslation(
  missingTranslation: MissingTranslation,
  logger?: Logger
): Promise<void> {
  const { videoId, type, languageId, order, crowdInId } = missingTranslation

  // Get the Crowdin file ID based on type
  let fileId: number
  let identifier: string

  switch (type) {
    case 'title':
      fileId = CROWDIN_CONFIG.files.media_metadata_tile.id
      identifier = `title_${videoId}`
      break
    case 'description':
      fileId = CROWDIN_CONFIG.files.media_metadata_description.id
      identifier = `description_${videoId}`
      break
    case 'studyQuestion':
      fileId = CROWDIN_CONFIG.files.study_questions.id
      identifier = `study_question_${videoId}_${order}`
      break
    default:
      throw new Error(`Unknown translation type: ${type}`)
  }

  // Get or create the source string in Crowdin
  const stringId = await getOrCreateSourceString(
    fileId,
    identifier,
    videoId,
    type,
    order,
    logger
  )

  if (!stringId) {
    logger?.warn(`Could not get/create source string for ${identifier}`)
    return
  }

  // Get the language code for the target language
  const languageCode = Object.keys(LANGUAGE_CODES).find(
    (key) => LANGUAGE_CODES[key as keyof typeof LANGUAGE_CODES] === languageId
  )

  if (!languageCode) {
    logger?.warn(`Unknown language code for language ID: ${languageId}`)
    return
  }

  // Fetch translation from Crowdin
  const translation = await fetchTranslation(stringId, languageCode, logger)

  if (!translation) {
    logger?.warn(`No translation found for ${identifier} in ${languageCode}`)
    return
  }

  // Upsert the translation into the database
  await upsertTranslation(missingTranslation, translation, logger)
}

async function getOrCreateSourceString(
  fileId: number,
  identifier: string,
  videoId: string,
  type: 'title' | 'description' | 'studyQuestion',
  order?: number,
  logger?: Logger
): Promise<number | null> {
  try {
    // First try to find existing string
    const existingStrings =
      await crowdinClient.sourceStringsApi.listProjectStrings(
        crowdinProjectId,
        {
          fileId,
          filter: identifier,
          limit: 1,
          offset: 0
        }
      )

    if (existingStrings.data.length > 0) {
      return existingStrings.data[0].data.id
    }

    // If not found, create a new one
    const context = getContextForType(videoId, type, order)
    const text = getDefaultTextForType(type)

    const response = await crowdinClient.sourceStringsApi.addString(
      crowdinProjectId,
      {
        fileId,
        identifier,
        text,
        context
      }
    )

    return response.data.id
  } catch (error) {
    logger?.error(`Failed to get/create source string:`, {
      fileId,
      identifier,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return null
  }
}

function getContextForType(
  videoId: string,
  type: 'title' | 'description' | 'studyQuestion',
  order?: number
): string {
  switch (type) {
    case 'title':
      return `${videoId}\nVideo title`
    case 'description':
      return `${videoId}\nVideo description`
    case 'studyQuestion':
      return `${videoId}\nStudy question ${order}`
    default:
      return videoId
  }
}

function getDefaultTextForType(
  type: 'title' | 'description' | 'studyQuestion'
): string {
  switch (type) {
    case 'title':
      return 'Untitled'
    case 'description':
      return 'No description available'
    case 'studyQuestion':
      return 'Study question'
    default:
      return ''
  }
}

async function fetchTranslation(
  stringId: number,
  languageCode: string,
  logger?: Logger
): Promise<string | null> {
  try {
    const translations =
      await crowdinClient.stringTranslationsApi.listStringTranslations(
        crowdinProjectId,
        stringId,
        languageCode,
        1,
        0
      )

    if (translations.data.length > 0) {
      const translation = translations.data[0].data
      // Return the translated text
      return (translation as any).text || null
    }

    return null
  } catch (error) {
    logger?.error(`Failed to fetch translation:`, {
      stringId,
      languageCode,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return null
  }
}

async function upsertTranslation(
  missingTranslation: MissingTranslation,
  translationText: string,
  logger?: Logger
): Promise<void> {
  const { videoId, type, languageId, order } = missingTranslation

  try {
    switch (type) {
      case 'title':
        await prisma.videoTitle.upsert({
          where: {
            videoId_languageId: {
              videoId,
              languageId
            }
          },
          update: {
            value: translationText
          },
          create: {
            videoId,
            languageId,
            value: translationText,
            primary: false
          }
        })
        break

      case 'description':
        await prisma.videoDescription.upsert({
          where: {
            videoId_languageId: {
              videoId,
              languageId
            }
          },
          update: {
            value: translationText
          },
          create: {
            videoId,
            languageId,
            value: translationText,
            primary: false
          }
        })
        break

      case 'studyQuestion':
        if (!order) {
          throw new Error('Order is required for study questions')
        }
        await prisma.videoStudyQuestion.upsert({
          where: {
            videoId_languageId_order: {
              videoId,
              languageId,
              order
            }
          },
          update: {
            value: translationText
          },
          create: {
            videoId,
            languageId,
            value: translationText,
            order,
            primary: false
          }
        })
        break
    }

    logger?.debug(
      `Successfully upserted ${type} translation for video ${videoId} in language ${languageId}`
    )
  } catch (error) {
    logger?.error(`Failed to upsert translation:`, {
      videoId,
      type,
      languageId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}
