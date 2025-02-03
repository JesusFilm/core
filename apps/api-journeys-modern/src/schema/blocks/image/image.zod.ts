import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const ImageBlockSchema = BlockSchema.extend({
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
