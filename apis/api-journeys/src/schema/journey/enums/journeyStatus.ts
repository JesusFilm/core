import { JourneyStatus as PrismaJourneyStatus } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const JourneyStatus = builder.enumType(PrismaJourneyStatus, {
  name: 'JourneyStatus'
})
