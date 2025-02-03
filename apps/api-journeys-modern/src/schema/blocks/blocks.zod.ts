import { z } from 'zod'

import { ActionSchema } from './action/action.zod'
import { ButtonBlockSchema } from './button/button.zod'
import { CardBlockSchema } from './card/card.zod'
import { IconBlockSchema } from './icon/icon.zod'
import { ImageBlockSchema } from './image/image.zod'
import { TextResponseBlockSchema } from './textResponse/textResponse.zod'
import { TypographyBlockSchema } from './typography/typography.zod'

const BlockSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable()
})

const VideoBlockSourceSchema = z.enum([
  'internal',
  'youTube',
  'cloudflare',
  'mux'
])
const VideoBlockObjectFitSchema = z.enum(['fill', 'fit', 'zoomed'])

// RadioOptionBlock schema
const RadioOptionBlockSchema = BlockSchema.extend({
  label: z.string(),
  action: ActionSchema.nullable()
})

// RadioQuestionBlock schema
const RadioQuestionBlockSchema = BlockSchema.extend({})

// SignUpBlock schema
const SignUpBlockSchema = BlockSchema.extend({
  action: ActionSchema,
  submitIconId: z.string().nullable(),
  submitLabel: z.string().nullable()
})

// StepBlock schema
const StepBlockSchema = BlockSchema.extend({
  nextBlockId: z.string().nullable(),
  locked: z.boolean(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  slug: z.string().nullable()
})

// VideoBlock schema
const VideoBlockSchema = BlockSchema.extend({
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
  objectFit: VideoBlockObjectFitSchema.nullable()
})

// VideoTriggerBlock schema
const VideoTriggerBlockSchema = BlockSchema.extend({
  triggerStart: z.number(),
  action: ActionSchema.nullable()
})

const BlockUnionSchema = z.union([
  ButtonBlockSchema,
  CardBlockSchema,
  IconBlockSchema,
  ImageBlockSchema,
  RadioOptionBlockSchema,
  RadioQuestionBlockSchema,
  SignUpBlockSchema,
  StepBlockSchema,
  TextResponseBlockSchema,
  TypographyBlockSchema,
  VideoBlockSchema,
  VideoTriggerBlockSchema
])

export { BlockSchema, BlockUnionSchema }
