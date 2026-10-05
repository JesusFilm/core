import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma/media/client'

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
  videoId: z.string(),
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

async function upsertStudyQuestionTranslation(
  data: ProcessedTranslation,
  logger?: Logger
): Promise<void> {
  try {
    if (data.stringId == null) {
      logger?.debug(`Skipping study question - missing stringId: ${data.text}`)
      return
    }

    const crowdInId = data.stringId.toString()
    const questionData = getQuestionData(crowdInId)

    if (!questionData) {
      missingQuestions.add(crowdInId)
      return
    }

    const result = questionSchema.parse({
      crowdInId,
      value: data.text,
      languageId: data.languageId,
      order: questionData.order,
      videoId: questionData.videoId,
      primary: data.languageId === '529'
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
      `Failed to upsert study question ${data.stringId} in language ${data.languageId}:`,
      error
    )
  }
}
