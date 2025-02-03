import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().url(),
  __typename: z.literal('User')
})
