import { z } from 'zod'

import { UserSchema } from '../user/userTeam.zod'

export const UserJourneySchema = z.object({
  id: z.string(),
  role: z.string(),
  openedAt: z.string(),
  __typename: z.literal('UserJourney'),
  user: UserSchema
})
