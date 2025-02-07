import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const ImageBlockSchema = BlockSchema.extend({
  typename: z
    .literal('ImageBlock')
    .describe('This value must be "ImageBlock".'),
  src: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  alt: z.string(),
  blurhash: z
    .string()
    .describe('A blurhash string and it MUST be 28 characters in length'),
  scale: z.number().nullable(),
  focalTop: z.number().nullable(),
  focalLeft: z.number().nullable(),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('This is the CardBlock id, which is the parent of this block.')
})
export { ImageBlockSchema }
