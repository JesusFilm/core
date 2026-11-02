import { z } from 'zod'

/**
 * v0 journey schema for the AI journey builder (ENG-3767 "Journey schema").
 *
 * Two shapes share one tree. `journeyInputSchema` is what the model reads and
 * writes: an image is only its search and alt. `journeySchema` is what the
 * server checks and the browser keeps: the same, plus the photo the server
 * found for each image. The model never sees those fields, so it cannot
 * invent them; `resolveImages` copies them across from the previous journey
 * by image name.
 *
 * The schemas hold shape only; rules that need the whole journey (unique
 * names, links to real steps, ...) live in `checkJourney`. Descriptions double
 * as prompt guidance, because the JSON Schema shown to the model is generated
 * from `journeyInputSchema`.
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

/** What the model writes for an image. The server finds the photo. */
export const imageInputSchema = z
  .object({
    search: z
      .string()
      .min(1)
      .describe('A short stock-photo search, e.g. "sunrise over hills"'),
    alt: z.string().describe('Alt text describing the image')
  })
  .describe(
    'An image, found by its search. Keep the search of an existing image unless the plan changes that image; a new search means a new photo.'
  )

/** The stored image: the model's fields plus the photo the server found. */
export const imageSchema = imageInputSchema.extend({
  src: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  blurhash: z.string().optional()
})

type ImageInput = z.infer<typeof imageInputSchema>

function journeySchemaWith<TImage extends z.ZodType<ImageInput>>(
  image: TImage
) {
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
    image
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

  const contentItemSchema = z.discriminatedUnion('type', [
    textItemSchema,
    buttonItemSchema,
    imageItemSchema,
    videoItemSchema,
    pollItemSchema,
    multiselectItemSchema,
    textResponseItemSchema,
    spacerItemSchema
  ])

  const cardSchema = z.object({
    name: nameSchema,
    theme: z
      .enum(['light', 'dark'])
      .optional()
      .describe(
        'dark: light text on a dark card. light: dark text on a light card'
      ),
    backgroundColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional()
      .describe('Hex colour such as #1A2B3C'),
    backgroundImage: image.optional(),
    fullscreen: z
      .boolean()
      .optional()
      .describe(
        'How the backgroundImage shows. false (the default): the photo is sharp and clear at the top of the card, with the content below it. true: the photo fills the whole card but is blurred, with the content on top of it.'
      ),
    content: z.array(contentItemSchema).describe('Card content, top to bottom')
  })

  const stepSchema = z.object({
    name: nameSchema,
    next: nameSchema
      .optional()
      .describe('Default next step name, used when nothing else navigates'),
    card: cardSchema
  })

  return z.object({
    title: z.string().min(1),
    description: z.string(),
    steps: z.array(stepSchema).min(1).describe('Steps in order')
  })
}

/** The shape the model reads and writes. */
export const journeyInputSchema = journeySchemaWith(imageInputSchema)

/** The shape the server checks and the browser keeps. */
export const journeySchema = journeySchemaWith(imageSchema)

export type Journey = z.infer<typeof journeySchema>
export type JourneyInput = z.infer<typeof journeyInputSchema>
export type JourneyStep = Journey['steps'][number]
export type JourneyCard = JourneyStep['card']
export type ContentItem = JourneyCard['content'][number]
export type JourneyImage = z.infer<typeof imageSchema>
export type JourneyAction = z.infer<typeof actionSchema>

/** The journey as the model sees it: every image is its search and alt only. */
export function journeyForModel(journey: Journey): JourneyInput {
  return {
    ...journey,
    steps: journey.steps.map((step) => ({
      ...step,
      card: {
        ...step.card,
        ...(step.card.backgroundImage != null && {
          backgroundImage: imageForModel(step.card.backgroundImage)
        }),
        content: step.card.content.map((item) =>
          item.type === 'image'
            ? { ...item, image: imageForModel(item.image) }
            : item
        )
      }
    }))
  }
}

function imageForModel({ search, alt }: JourneyImage): ImageInput {
  return { search, alt }
}
