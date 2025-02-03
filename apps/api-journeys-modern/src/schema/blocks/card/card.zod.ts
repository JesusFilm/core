import { z } from 'zod'

export const CardBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string(),
  parentOrder: z.number(),
  backgroundColor: z.string().nullable(),
  coverBlockId: z.string(),
  themeMode: z.string().nullable(),
  themeName: z.string().nullable(),
  fullscreen: z.boolean(),
  __typename: z.literal('CardBlock')
})
