import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { CROWDIN_CONFIG } from '../../config'
import { processFile } from '../../importer'
import { ProcessedTranslation } from '../../types'

const questionMap = new Map<string, { videoId: string; order: number }>()
const missingQuestions = new Set<string>()

const questionSchema = z.object({
  crowdInId: z.string(),
  value: z.string(),
  languageId: z.string(),
  order: z.number(),
  primary: z.boolean()
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
      await upsertStudyQuestionTranslation(data, logger)
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
): { videoId: string; order: number } | undefined {
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
    questionMap.set(crowdInId, { videoId, order })
  })

  logger?.info({ count: questions.length }, 'Initialized question map')
}

function getQuestionId(context: string): string | undefined {
  if (!context) return undefined

  const firstLine = context.split('\n')[0]
  return firstLine
}

async function upsertStudyQuestionTranslation(
  data: ProcessedTranslation,
  logger?: Logger
): Promise<void> {
  try {
    const questionId = getQuestionId(data.context)
    if (!questionId) {
      logger?.debug(`Skipping study question - Invalid ID: ${data.context}`)
      return
    }

    const questionData = getQuestionData(questionId)
    if (!questionData) {
      missingQuestions.add(questionId)
      return
    }

    const result = questionSchema.parse({
      crowdInId: questionId,
      value: data.text,
      languageId: data.languageId,
      order: questionData.order,
      primary: false
    })

    await prisma.videoStudyQuestion.upsert({
      where: {
        videoId_languageId_order: {
          videoId: questionData.videoId,
          languageId: data.languageId,
          order: questionData.order
        }
      },
      update: result,
      create: result
    })
  } catch (error) {
    logger?.error(
      `Failed to upsert study question for video ${data.context} in language ${data.languageId}:`,
      error
    )
  }
}
