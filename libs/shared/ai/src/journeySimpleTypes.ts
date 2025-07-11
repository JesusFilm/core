import { z } from 'zod'

// --- Poll Option Schemas ---
export const journeySimplePollOptionSchema = z.object({
  text: z.string().describe('The text label for the poll option.'),
  nextCard: z
    .string()
    .optional()
    .describe(
      'The id of the card to navigate to if this option is selected. Something like card-1, card-2, etc. Should only provide one of url or nextCard.'
    ),
  url: z
    .string()
    .optional()
    .describe(
      'A URL to navigate to when the poll option is selected. Should only provide one of url or nextCard.'
    )
})

export const journeySimplePollOptionSchemaUpdate =
  journeySimplePollOptionSchema.superRefine((data, ctx) => {
    const hasNextCard = !!data.nextCard
    const hasUrl = !!data.url
    if (hasNextCard === hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Exactly one of nextCard or url must be provided.'
      })
    }
  })

export type JourneySimplePollOption = z.infer<
  typeof journeySimplePollOptionSchema
>
export type JourneySimplePollOptionUpdate = z.infer<
  typeof journeySimplePollOptionSchemaUpdate
>

// --- Button Schemas ---
export const journeySimpleButtonSchema = z.object({
  text: z.string().describe('The text label displayed on the button.'),
  nextCard: z
    .string()
    .optional()
    .describe(
      'The id of the card to navigate to when the button is pressed. Something like card-1, card-2, etc. Should only provide one of url or nextCard.'
    ),
  url: z
    .string()
    .optional()
    .describe(
      'A URL to navigate to when the button is pressed. Should only provide one of url or nextCard.'
    )
})

export const journeySimpleButtonSchemaUpdate =
  journeySimpleButtonSchema.superRefine((data, ctx) => {
    const hasNextCard = !!data.nextCard
    const hasUrl = !!data.url
    if (hasNextCard === hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Exactly one of nextCard or url must be provided.'
      })
    }
  })

export type JourneySimpleButton = z.infer<typeof journeySimpleButtonSchema>
export type JourneySimpleButtonUpdate = z.infer<
  typeof journeySimpleButtonSchemaUpdate
>

// --- Image Schema (shared, no update/default distinction needed) ---
export const journeySimpleImageSchema = z.object({
  src: z.string().describe('A URL for the image.'),
  alt: z.string().describe('Alt text for the image for accessibility.'),
  width: z.number().int().positive().describe('Width of the image in pixels.'),
  height: z
    .number()
    .int()
    .positive()
    .describe('Height of the image in pixels.'),
  blurhash: z
    .string()
    .describe('A compact representation of a placeholder for the image.')
})
export type JourneySimpleImage = z.infer<typeof journeySimpleImageSchema>

// --- Card Schemas ---
export const journeySimpleCardSchema = z.object({
  id: z
    .string()
    .describe('The id of the card. Something like card-1, card-2, etc.'),
  heading: z
    .string()
    .optional()
    .describe('A heading for the card, if present.'),
  text: z.string().optional().describe('The main text content of the card.'),
  button: journeySimpleButtonSchema
    .optional()
    .describe('A button object for this card, if present.'),
  poll: z
    .array(journeySimplePollOptionSchema)
    .optional()
    .describe('An array of poll options for this card, if present.'),
  image: journeySimpleImageSchema
    .optional()
    .describe('Image object for the card.'),
  backgroundImage: journeySimpleImageSchema
    .optional()
    .describe('Background image object for the card.'),
  defaultNextCard: z
    .string()
    .optional()
    .describe(
      'The id of the card to navigate to after this card by default. Something like card-1, card-2, etc.'
    )
})

export const journeySimpleCardSchemaUpdate = journeySimpleCardSchema
  .extend({
    button: journeySimpleButtonSchemaUpdate.optional(),
    poll: z.array(journeySimplePollOptionSchemaUpdate).optional()
  })
  .superRefine((data, ctx) => {
    const hasButton = !!data.button
    const hasPoll = Array.isArray(data.poll) && data.poll.length > 0
    const hasDefaultNextCard = !!data.defaultNextCard
    if (!hasButton && !hasPoll && !hasDefaultNextCard) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'At least one of button, poll, or defaultNextCard must be present to provide navigation.'
      })
    }
  })

export type JourneySimpleCard = z.infer<typeof journeySimpleCardSchema>
export type JourneySimpleCardUpdate = z.infer<
  typeof journeySimpleCardSchemaUpdate
>

// --- Journey Schemas ---
export const journeySimpleSchema = z.object({
  title: z.string().describe('The title of the journey.'),
  description: z.string().describe('A description of the journey.'),
  cards: z
    .array(journeySimpleCardSchema)
    .describe('An array of cards that make up the journey.')
})

export const journeySimpleSchemaUpdate = journeySimpleSchema.extend({
  cards: z.array(journeySimpleCardSchemaUpdate)
})

export type JourneySimple = z.infer<typeof journeySimpleSchema>
export type JourneySimpleUpdate = z.infer<typeof journeySimpleSchemaUpdate>
