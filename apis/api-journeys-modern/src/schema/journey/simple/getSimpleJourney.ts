import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../../lib/prisma'

import { simplifyJourney } from './simplifyJourney'

export async function getSimpleJourney(journeyId: string) {
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
    throw new Error(
      'Transformed journey data is invalid: ' +
        JSON.stringify(result.error.format())
    )
  }
  return result.data
}
