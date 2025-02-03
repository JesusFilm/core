import { z } from 'zod'

import { ActionSchema } from './action/action.zod'
import { ButtonBlockSchema } from './button/button.zod'
import { CardBlockSchema } from './card/card.zod'
import { IconBlockSchema } from './icon/icon.zod'
import { ImageBlockSchema } from './image/image.zod'
import { TextResponseBlockSchema } from './textResponse/textResponse.zod'
import { TypographyBlockSchema } from './typography/typography.zod'
import { VideoBlockSchema } from './video/video.zod'

const BlockSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable()
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
