import { UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const UserJourneyRoleEnum = builder.enumType('UserJourneyRole', {
  values: Object.values(UserJourneyRole)
})
