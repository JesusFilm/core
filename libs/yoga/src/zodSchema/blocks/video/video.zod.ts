import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

const VideoBlockSourceSchema = z
  .enum(['internal', 'youTube', 'cloudflare', 'mux'])
  .describe('The source platform for the video content.')

const VideoBlockObjectFitSchema = z
  .enum(['fill', 'fit', 'zoomed'])
  .describe('How the video should be resized to fit its container.')

const VideoBlockSchema = BlockSchema.extend({
  typename: z
    .literal('VideoBlock')
    .describe('This value must be "VideoBlock".'),
  startAt: z.number().nullable(),
  endAt: z.number().nullable(),
  muted: z.boolean().nullable(),
  autoplay: z.boolean().nullable(),
  posterBlockId: z.string().nullable(),
  fullsize: z.boolean().nullable(),
  videoId: z.string().nullable(),
  videoVariantLanguageId: z.string().nullable(),
  source: VideoBlockSourceSchema,
  title: z.string().nullable(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  duration: z.number().nullable(),
  action: ActionSchema.nullable(),
  objectFit: VideoBlockObjectFitSchema.nullable(),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('This is the CardBlock id, which is the parent of this block.')
})

export { VideoBlockSchema, VideoBlockSourceSchema, VideoBlockObjectFitSchema }
