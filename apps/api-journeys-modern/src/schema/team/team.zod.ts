import { z } from 'zod'

const TeamSchema = z.object({
  id: z.string(),
  title: z.string(),
  publicTitle: z.string(),
  __typename: z.literal('Team')
})
