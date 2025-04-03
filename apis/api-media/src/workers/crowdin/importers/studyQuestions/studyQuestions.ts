import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { getTranslationText, processFile } from '../../importer'
import { TranslationData } from '../../types'

const questionMap = new Map<string, Array<{ videoId: string; order: number }>>()
const missingQuestions = new Set<string>()

async function initializeQuestionMap(logger?: Logger): Promise<void> {
  const questions = await prisma.videoStudyQuestion.findMany({
    select: {
      videoId: true,
      order: true,
      crowdInId: true
    },
    where: {
      crowdInId: { not: null },
      videoId: { not: null },
      languageId: { equals: '529' }
    }
  })

  questions.forEach((question) => {
    const { crowdInId, videoId, order } = question
    if (!crowdInId || !videoId) return

    questionMap.set(crowdInId, [
      ...(questionMap.get(crowdInId) || []),
      { videoId, order }
    ])
  })

  logger?.info({ count: questions.length }, 'Found existing study questions')
}

function getQuestionData(
  questionId: string
): Array<{ videoId: string; order: number }> | undefined {
  return questionMap.get(questionId)
}

function hasQuestion(questionId: string): boolean {
  return questionMap.has(questionId)
}

function clearQuestionMap(): void {
  questionMap.clear()
}

function getQuestionId(data: TranslationData): string | undefined {
  const context = data.sourceString.context
  if (!context) return undefined

  // Get the first line of the context which should be our ID
  const firstLine = context.split('\n')[0]
  return firstLine
}

function validateStudyQuestionData(data: TranslationData): boolean {
  const questionId = getQuestionId(data)
  if (!questionId || !hasQuestion(questionId)) {
    if (questionId) {
      missingQuestions.add(questionId)
    }
    return false
  }
  return true
}

async function upsertStudyQuestionTranslation(
  data: TranslationData
): Promise<void> {
  // Log missing questions summary when we're done processing
  if (missingQuestions.size > 0) {
    console.warn('Questions do not exist in database', {
      count: missingQuestions.size,
      questions: Array.from(missingQuestions)
    })
    missingQuestions.clear()
  }

  const text = getTranslationText(data.translation)
  if (!text) return

  const languageId =
    CROWDIN_CONFIG.languageCodes[
      data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
    ]
  if (!languageId) return

  const questionId = getQuestionId(data)
  if (!questionId) return

  const questions = getQuestionData(questionId)
  if (!questions || questions.length === 0) return

  // Since we have the data in our cache, we can use it directly
  await Promise.all(
    questions.map(({ videoId, order }) =>
      prisma.videoStudyQuestion.upsert({
        where: {
          videoId_languageId_order: {
            videoId,
            languageId,
            order
          }
        },
        update: {
          value: text
        },
        create: {
          videoId,
          languageId,
          order,
          value: text,
          primary: false,
          crowdInId: questionId
        }
      })
    )
  )
}

export async function importStudyQuestions(
  sourceStringsApi: SourceStrings,
  stringTranslationsApi: StringTranslations,
  logger?: Logger
): Promise<() => void> {
  await initializeQuestionMap(logger)

  await processFile(
    CROWDIN_CONFIG.files.study_questions,
    upsertStudyQuestionTranslation,
    async (data) => {
      for (const item of data) {
        await upsertStudyQuestionTranslation(item)
      }
    },
    {
      sourceStrings: sourceStringsApi,
      stringTranslations: stringTranslationsApi
    },
    logger
  )

  return () => clearQuestionMap()
}
