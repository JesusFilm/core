import { z } from 'zod'

export const TypographyBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string(),
  parentOrder: z.number(),
  align: z.string().nullable(),
  color: z.string().nullable(),
  content: z.string(),
  variant: z.string(),
  __typename: z.literal('TypographyBlock')
})
