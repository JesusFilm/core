import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

// Cache for study question IDs to avoid repeated database queries
let questionMap = new Map<string, Array<{ videoId: string; order: number }>>()

export async function initializeQuestionMap(logger?: Logger): Promise<void> {
  const questions = await prisma.videoStudyQuestion.findMany({
    select: {
      videoId: true,
      order: true,
      crowdInId: true
    },
    where: {
      crowdInId: { not: null }
    }
  })

  // Group questions by crowdInId
  questionMap = questions.reduce((acc, question) => {
    if (!question.crowdInId) return acc

    const existing = acc.get(question.crowdInId) || []
    existing.push({
      videoId: question.videoId,
      order: question.order
    })
    acc.set(question.crowdInId, existing)
    return acc
  }, new Map())

  logger?.info({ count: questions.length }, 'Found existing study questions')
}

export function getQuestionData(
  questionId: string
): Array<{ videoId: string; order: number }> | undefined {
  return questionMap.get(questionId)
}

export function hasQuestion(questionId: string): boolean {
  return questionMap.has(questionId)
}

export function clearQuestionMap(): void {
  questionMap.clear()
}
