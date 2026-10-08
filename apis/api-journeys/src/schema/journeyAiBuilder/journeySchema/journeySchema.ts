import { z } from 'zod'

/**
 * v0 journey schema for the AI journey builder (ENG-3767 "Journey schema").
 *
 * This is the shape Qwen writes and the server checks. It holds shape only;
 * rules that need the whole journey (unique names, links to real steps, ...)
 * live in `checkJourney`. Descriptions double as prompt guidance, because the
 * JSON Schema sent to the gateway is generated from this file.
 *
 * Deliberately separate from `libs/shared/ai/src/journeySimpleTypes.ts`, which
 * `journeySimple` still uses.
 */

export const NAME_PATTERN = /^[a-z0-9-]+$/

export const nameSchema = z
  .string()
  .regex(NAME_PATTERN)
  .describe(
    'Stable lowercase-with-dashes name, unique across the whole journey, e.g. "welcome" or "prayer-poll". Never rename something that already exists.'
  )

/** Subset of the block IconName enum that makes sense on a button. */
export const BUTTON_ICONS = [
  'ArrowForwardRounded',
  'ArrowBackRounded',
  'ChevronRightRounded',
  'CheckCircleRounded',
  'ChatBubbleOutlineRounded',
  'ContactSupportRounded',
  'FormatQuoteRounded',
  'Launch',
  'LinkAngled',
  'LiveTvRounded',
  'LockOpenRounded',
  'MailOutline',
  'MenuBookRounded',
  'MessageChat1',
  'Phone',
  'PlayArrowRounded',
  'SendRounded',
  'SubscriptionsRounded',
  'TranslateRounded',
  'UserProfile2',
  'UsersProfiles3'
] as const

export const actionSchema = z
  .union([
    z.object({ goTo: nameSchema.describe('Name of the step to go to') }),
    z.object({ url: z.string().describe('An http(s) link') })
  ])
  .describe('Exactly one of goTo (a step name) or url')

export const imageSchema = z
  .object({
    search: z
      .string()
      .min(1)
      .describe('A short stock-photo search, e.g. "sunrise over hills"'),
    alt: z.string().describe('Alt text describing the image'),
    src: z
      .string()
      .optional()
      .describe('Filled in by the server. Copy it unchanged; never invent one.'),
    width: z.number().optional().describe('Filled in by the server'),
    height: z.number().optional().describe('Filled in by the server'),
    blurhash: z.string().optional().describe('Filled in by the server')
  })
  .describe(
    'An image. Write only search and alt for a new image. Keep an existing image object exactly as it is unless the plan changes that image.'
  )

const textItemSchema = z.object({
  type: z.literal('text'),
  name: nameSchema,
  content: z.string().min(1),
  style: z.enum(['title', 'heading', 'subtitle', 'body', 'caption']),
  align: z.enum(['left', 'center', 'right']).optional()
})

const buttonItemSchema = z.object({
  type: z.literal('button'),
  name: nameSchema,
  label: z.string().min(1),
  style: z.enum(['primary', 'secondary']),
  icon: z.enum(BUTTON_ICONS).optional(),
  action: actionSchema
})

const imageItemSchema = z.object({
  type: z.literal('image'),
  name: nameSchema,
  image: imageSchema
})

const videoItemSchema = z.object({
  type: z.literal('video'),
  name: nameSchema,
  url: z.string().describe('A YouTube link'),
  startAt: z.number().int().min(0).optional().describe('Seconds'),
  endAt: z.number().int().min(0).optional().describe('Seconds')
})

const pollItemSchema = z.object({
  type: z.literal('poll'),
  name: nameSchema,
  options: z
    .array(
      z.object({
        name: nameSchema,
        label: z.string().min(1),
        action: actionSchema
      })
    )
    .min(1)
})

const multiselectItemSchema = z.object({
  type: z.literal('multiselect'),
  name: nameSchema,
  options: z
    .array(z.object({ name: nameSchema, label: z.string().min(1) }))
    .min(1),
  min: z.number().int().min(0).optional(),
  max: z.number().int().min(1).optional()
})

const textResponseItemSchema = z.object({
  type: z.literal('textResponse'),
  name: nameSchema,
  label: z.string().min(1),
  placeholder: z.string().optional(),
  kind: z.enum(['freeForm', 'name', 'email']),
  required: z.boolean().optional()
})

const spacerItemSchema = z.object({
  type: z.literal('spacer'),
  name: nameSchema,
  size: z.enum(['small', 'medium', 'large'])
})

export const contentItemSchema = z.discriminatedUnion('type', [
  textItemSchema,
  buttonItemSchema,
  imageItemSchema,
  videoItemSchema,
  pollItemSchema,
  multiselectItemSchema,
  textResponseItemSchema,
  spacerItemSchema
])

export const cardSchema = z.object({
  name: nameSchema,
  theme: z.enum(['light', 'dark']).optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .describe('Hex colour such as #1A2B3C'),
  backgroundImage: imageSchema.optional(),
  fullscreen: z
    .boolean()
    .optional()
    .describe('Show the background image across the whole card'),
  content: z.array(contentItemSchema).describe('Card content, top to bottom')
})

export const stepSchema = z.object({
  name: nameSchema,
  next: nameSchema
    .optional()
    .describe('Default next step name, used when nothing else navigates'),
  card: cardSchema
})

export const journeySchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  steps: z.array(stepSchema).min(1).describe('Steps in order')
})

export type Journey = z.infer<typeof journeySchema>
export type JourneyStep = z.infer<typeof stepSchema>
export type JourneyCard = z.infer<typeof cardSchema>
export type ContentItem = z.infer<typeof contentItemSchema>
export type JourneyImage = z.infer<typeof imageSchema>
export type JourneyAction = z.infer<typeof actionSchema>
