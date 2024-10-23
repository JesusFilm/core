import { JourneyStatus as PrismaJourneyStatus } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const JourneyStatus = builder.enumType(PrismaJourneyStatus, {
  name: 'JourneyStatus'
})
