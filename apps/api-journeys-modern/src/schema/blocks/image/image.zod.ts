import { z } from 'zod'

export const ImageBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  src: z.string().url(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  blurhash: z.string(),
  scale: z.number().nullable(),
  focalTop: z.number(),
  focalLeft: z.number(),
  __typename: z.literal('ImageBlock')
})
