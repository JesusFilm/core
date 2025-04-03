import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { TranslationData } from '../../types'

const questionMap = new Map<string, Array<{ videoId: string; order: number }>>()
const missingQuestions = new Set<string>()

const studyQuestionSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageCode: z.string(),
    context: z.string().optional()
  })
  .transform((data) => {
    const questionId = getQuestionId({
      sourceString: { context: data.context }
    } as TranslationData)
    if (!questionId) throw new Error('Missing question ID')

    const questions = getQuestionData(questionId)
    if (!questions || questions.length === 0)
      throw new Error('Question not found')

    return questions.map(({ videoId, order }) => ({
      videoId,
      languageId: data.languageCode,
      order,
      value: data.text,
      primary: false,
      crowdInId: questionId
    }))
  })

function getQuestionData(
  questionId: string
): Array<{ videoId: string; order: number }> | undefined {
  return questionMap.get(questionId)
}

function hasQuestion(questionId: string): boolean {
  return questionMap.has(questionId)
}

function clearState(): void {
  questionMap.clear()
  missingQuestions.clear()
}

async function initializeQuestionMap(): Promise<void> {
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
}

function getQuestionId(data: TranslationData): string | undefined {
  const context = data.sourceString.context
  if (!context) return undefined

  // Get the first line of the context which should be our ID
  const firstLine = context.split('\n')[0]
  return firstLine
}

function validateStudyQuestionData(data: TranslationData): boolean {
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
  if (!validateStudyQuestionData(data)) return

  const result = studyQuestionSchema.parse({
    identifier: data.sourceString.identifier,
    text: data.translation.text,
    languageCode:
      CROWDIN_CONFIG.languageCodes[
        data.languageCode as keyof typeof CROWDIN_CONFIG.languageCodes
      ],
    context: data.sourceString.context
  })

  await Promise.all(
    result.map((question) =>
      prisma.videoStudyQuestion.upsert({
        where: {
          videoId_languageId_order: {
            videoId: question.videoId,
            languageId: question.languageId,
            order: question.order
          }
        },
        update: question,
        create: question
      })
    )
  )
}

export async function importStudyQuestions(): Promise<void> {
  await initializeQuestionMap()

  await processFile(
    CROWDIN_CONFIG.files.study_questions,
    upsertStudyQuestionTranslation
  )

  clearState()
}
