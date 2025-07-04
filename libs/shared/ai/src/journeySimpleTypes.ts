import { z } from 'zod'

// Poll option type
export const journeySimplePollOptionSchema = z.object({
  text: z.string().describe('The text label for the poll option.'),
  nextCard: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'The index of the next card to navigate to if this option is selected.'
    )
})
export type JourneySimplePollOption = z.infer<
  typeof journeySimplePollOptionSchema
>

// Button type
export const journeySimpleButtonSchema = z.object({
  text: z.string().describe('The text label displayed on the button.'),
  nextCard: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'The index of the next card to navigate to when the button is pressed.'
    )
})
export type JourneySimpleButton = z.infer<typeof journeySimpleButtonSchema>

// Image type
export const journeySimpleImageSchema = z.object({
  src: z.string().describe('A URL for the image.'),
  alt: z.string().describe('Alt text for the image for accessibility.'),
  width: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Width of the image in pixels.'),
  height: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Height of the image in pixels.')
})
export type JourneySimpleImage = z.infer<typeof journeySimpleImageSchema>

// Card type
export const journeySimpleCardSchema = z.object({
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
  nextCard: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'The index of the next card to navigate to after this card, if present.'
    )
})
export type JourneySimpleCard = z.infer<typeof journeySimpleCardSchema>

// Journey type
export const journeySimpleSchema = z.object({
  title: z.string().describe('The title of the journey.'),
  description: z.string().describe('A description of the journey.'),
  cards: z
    .array(journeySimpleCardSchema)
    .describe('An array of cards that make up the journey.')
})
export type JourneySimple = z.infer<typeof journeySimpleSchema>
