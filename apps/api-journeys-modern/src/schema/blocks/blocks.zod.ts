import { z } from 'zod'

import { CardBlockSchema } from './card/card.zod'
import { IconBlockSchema } from './icon/icon.zod'
import { ImageBlockSchema } from './image/image.zod'
import { TypographyBlockSchema } from './typography/typography.zod'

const BlockSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable()
})

// Zod schemas for enums
const ButtonVariantSchema = z.enum(['text', 'contained'])
const ButtonColorSchema = z.enum(['primary', 'secondary', 'error', 'inherit'])
const ButtonSizeSchema = z.enum(['small', 'medium', 'large'])

const TextResponseTypeSchema = z.enum(['freeForm', 'name', 'email'])

const VideoBlockSourceSchema = z.enum([
  'internal',
  'youTube',
  'cloudflare',
  'mux'
])
const VideoBlockObjectFitSchema = z.enum(['fill', 'fit', 'zoomed'])

// Action schema
const ActionSchema = z.object({
  parentBlockId: z.string(),
  parentBlock: BlockSchema,
  gtmEventName: z.string().nullable()
})

// Concrete Block type schemas

// ButtonBlock schema
const ButtonBlockSchema = BlockSchema.extend({
  label: z.string(),
  variant: ButtonVariantSchema.nullable(),
  color: ButtonColorSchema.nullable(),
  size: ButtonSizeSchema.nullable(),
  startIconId: z.string().nullable(),
  endIconId: z.string().nullable(),
  action: ActionSchema.nullable()
})

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

// TextResponseBlock schema
const TextResponseBlockSchema = BlockSchema.extend({
  label: z.string(),
  hint: z.string().nullable(),
  minRows: z.number().nullable(),
  type: TextResponseTypeSchema.nullable(),
  routeId: z.string().nullable(),
  integrationId: z.string().nullable()
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
