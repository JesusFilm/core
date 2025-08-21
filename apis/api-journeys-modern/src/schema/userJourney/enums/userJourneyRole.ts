import { UserJourneyRole as PrismaUserJourneyRole } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const UserJourneyRole = builder.enumType(PrismaUserJourneyRole, {
  name: 'UserJourneyRole'
})
