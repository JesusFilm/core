import { z } from 'zod'

// Poll option type
export const journeySimplePollOptionSchema = z.object({
  text: z.string().describe('The text label for the poll option.'),
  nextCard: z
    .number()
    .int()
    .nonnegative()
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
    .describe(
      'The index of the next card to navigate to when the button is pressed.'
    )
})
export type JourneySimpleButton = z.infer<typeof journeySimpleButtonSchema>

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
  image: z
    .string()
    .url()
    .optional()
    .describe('A URL for an image to display in the card.'),
  backgroundImage: z
    .string()
    .url()
    .optional()
    .describe('A URL for a background image for the card.'),
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
