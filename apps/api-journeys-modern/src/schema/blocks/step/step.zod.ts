import { z } from 'zod'

export const StepBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number(),
  locked: z.boolean(),
  nextBlockId: z.string().nullable(),
  slug: z.string().nullable(),
  __typename: z.literal('StepBlock')
})
