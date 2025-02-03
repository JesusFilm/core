import { z } from 'zod'

const ImageBlockSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  src: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  alt: z.string(),
  blurhash: z.string(),
  scale: z.number().nullable(),
  focalTop: z.number().nullable(),
  focalLeft: z.number().nullable()
})

export { ImageBlockSchema }
