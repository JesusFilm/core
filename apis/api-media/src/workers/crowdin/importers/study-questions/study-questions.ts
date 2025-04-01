import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import { prisma } from '../../../../lib/prisma'
import { ARCLIGHT_FILES } from '../../shared/arclight-files'
import {
  BaseTranslation,
  CROWDIN_LANGUAGE_CODE_TO_ID,
  TranslationData
} from '../shared/base-translation'

const questionMap = new Map<string, Array<{ videoId: string; order: number }>>()

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

export async function importStudyQuestions(
  sourceStringsApi: SourceStrings,
  stringTranslationsApi: StringTranslations,
  logger?: Logger
): Promise<() => void> {
  await initializeQuestionMap(logger)

  const translator = new StudyQuestionsTranslator(
    sourceStringsApi,
    stringTranslationsApi,
    logger
  )
  const validateData = translator.validateData.bind(translator)
  const upsertTranslation = translator.upsertTranslation.bind(translator)

  await translator.processFile(
    ARCLIGHT_FILES.study_questions,
    validateData,
    upsertTranslation
  )

  return () => clearQuestionMap()
}

class StudyQuestionsTranslator extends BaseTranslation {
  private missingQuestions = new Set<string>()

  private getQuestionId(data: TranslationData): string | undefined {
    const context = data.sourceString.context
    if (!context) return undefined

    // Get the first line of the context which should be our ID
    const firstLine = context.split('\n')[0]
    return firstLine
  }

  validateData(data: TranslationData): boolean {
    const questionId = this.getQuestionId(data)
    if (!questionId || !hasQuestion(questionId)) {
      if (questionId) {
        this.missingQuestions.add(questionId)
      }
      return false
    }
    return true
  }

  async upsertTranslation(data: TranslationData): Promise<void> {
    // Log missing questions summary when we're done processing
    if (this.missingQuestions.size > 0) {
      this.logger?.warn(
        {
          count: this.missingQuestions.size,
          questions: Array.from(this.missingQuestions)
        },
        'Questions do not exist in database'
      )
      this.missingQuestions.clear()
    }

    const text = this.getTranslationText(data.translation)
    if (!text) return

    const languageId =
      CROWDIN_LANGUAGE_CODE_TO_ID[
        data.languageCode as keyof typeof CROWDIN_LANGUAGE_CODE_TO_ID
      ]
    if (!languageId) return

    const questionId = this.getQuestionId(data)
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
}
