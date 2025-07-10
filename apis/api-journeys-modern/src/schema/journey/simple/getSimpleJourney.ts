import {
  JourneySimple,
  journeySimpleSchema
} from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../../lib/prisma'

import { simplifyJourney } from './simplifyJourney'

export async function getSimpleJourney(
  journeyId: string
): Promise<JourneySimple> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      blocks: {
        where: { deletedAt: null },
        include: { action: true }
      }
    }
  })
  if (!journey) throw new Error('Journey not found')

  const simpleJourney = simplifyJourney(journey)
  const result = journeySimpleSchema.safeParse(simpleJourney)
  if (!result.success) {
    console.error(
      'Zod validation error in getSimpleJourney:',
      result.error.format()
    )
    throw new Error(
      'Transformed journey data is invalid. Please contact support.'
    )
  }
  return result.data
}
