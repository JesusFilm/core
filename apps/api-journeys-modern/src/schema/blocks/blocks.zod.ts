import { z } from 'zod'

import { CardBlockSchema } from './card/card.zod'
import { IconBlockSchema } from './icon/icon.zod'

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

// const GridDirectionSchema = z.enum([
//   'columnReverse',
//   'column',
//   'row',
//   'rowReverse'
// ])
// const GridJustifyContentSchema = z.enum(['flexStart', 'flexEnd', 'center'])
// const GridAlignItemsSchema = z.enum([
//   'baseline',
//   'flexStart',
//   'flexEnd',
//   'center'
// ])

const TextResponseTypeSchema = z.enum(['freeForm', 'name', 'email'])

const TypographyVariantSchema = z.enum([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'overline'
])

const TypographyColorSchema = z.enum(['primary', 'secondary', 'error'])
const TypographyAlignSchema = z.enum(['left', 'center', 'right'])

const VideoBlockSourceSchema = z.enum([
  'internal',
  'youTube',
  'cloudflare',
  'mux'
])
const VideoBlockObjectFitSchema = z.enum(['fill', 'fit', 'zoomed'])

// Export all enum schemas
export {
  ButtonVariantSchema,
  ButtonColorSchema,
  ButtonSizeSchema,
  TextResponseTypeSchema,
  TypographyVariantSchema,
  TypographyColorSchema,
  TypographyAlignSchema,
  VideoBlockSourceSchema,
  VideoBlockObjectFitSchema
}

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

// GridContainerBlock schema
// const GridContainerBlockSchema = BlockSchema.extend({
//   spacing: z.number(),
//   direction: GridDirectionSchema,
//   justifyContent: GridJustifyContentSchema,
//   alignItems: GridAlignItemsSchema
// })

// GridItemBlock schema
// const GridItemBlockSchema = BlockSchema.extend({
//   xl: z.number(),
//   lg: z.number(),
//   sm: z.number()
// })

// ImageBlock schema
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

// TypographyBlock schema
const TypographyBlockSchema = BlockSchema.extend({
  content: z.string(),
  variant: TypographyVariantSchema.nullable(),
  color: TypographyColorSchema.nullable(),
  align: TypographyAlignSchema.nullable()
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

export {
  BlockSchema,
  BlockUnionSchema,
  ActionSchema,
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
}
