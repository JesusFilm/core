import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

const questionMap = new Map<string, Array<{ videoId: string; order: number }>>()
const missingQuestions = new Set<string>()

const studyQuestionSchema = z
  .object({
    identifier: z.string(),
    text: z.string(),
    languageId: z.string(),
    context: z.string()
  })
  .transform((data) => {
    const questionId = getQuestionId(data.context)

    if (!questionId) throw new Error('Question not found')

    const questionData = getQuestionData(questionId)
    if (!questionData || questionData.length === 0) {
      missingQuestions.add(questionId)
      throw new Error('Question not found')
    }

    return questionData.map(({ videoId, order }) => ({
      videoId,
      languageId: data.languageId,
      order,
      value: data.text,
      primary: false,
      crowdInId: questionId
    }))
  })

export async function importStudyQuestions(
  parentLogger?: Logger
): Promise<() => void> {
  const logger = parentLogger?.child({ importer: 'studyQuestions' })
  logger?.info('Starting study questions import')

  await initializeQuestionMap(logger)

  await processFile(
    CROWDIN_CONFIG.files.study_questions,
    async (data: ProcessedTranslation) => {
      await upsertStudyQuestionTranslation(data)
    },
    logger
  )

  if (missingQuestions.size > 0) {
    logger?.warn(
      {
        count: missingQuestions.size,
        questions: Array.from(missingQuestions)
      },
      'Study questions not found in database'
    )
  }

  logger?.info('Finished study questions import')
  return () => {
    questionMap.clear()
    missingQuestions.clear()
  }
}

function getQuestionData(
  questionId: string
): Array<{ videoId: string; order: number }> | undefined {
  return questionMap.get(questionId)
}

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

  logger?.info({ count: questions.length }, 'Initialized question map')
}

function getQuestionId(context: string): string | undefined {
  if (!context) return undefined

  const firstLine = context.split('\n')[0]
  return firstLine
}

async function upsertStudyQuestionTranslation(
  data: ProcessedTranslation
): Promise<void> {
  const result = studyQuestionSchema.parse({
    identifier: data.identifier,
    text: data.text,
    languageId: data.languageId,
    context: data.context
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
