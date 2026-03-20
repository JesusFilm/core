import { z } from 'zod'

// --- Shared URL validation ---
const safeUrl = z
  .string()
  .url()
  .refine(
    (u) => u.startsWith('https://') || u.startsWith('http://'),
    'Only https:// and http:// URLs are allowed'
  )

// --- Actions (discriminated union by `kind`) ---
export const journeySimpleActionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('navigate'),
    cardId: z.string().describe('The id of the card to navigate to.')
  }),
  z.object({
    kind: z.literal('url'),
    url: safeUrl.describe('A URL to open in the browser.')
  }),
  z.object({
    kind: z.literal('email'),
    email: z
      .string()
      .email()
      .describe('An email address to open in the mail client.')
  }),
  z.object({
    kind: z.literal('chat'),
    chatUrl: safeUrl.describe('A WhatsApp or chat URL.')
  }),
  z.object({
    kind: z.literal('phone'),
    phone: z.string(),
    countryCode: z.string().optional(),
    contactAction: z.enum(['call', 'text']).optional()
  })
])

export type JourneySimpleAction = z.infer<typeof journeySimpleActionSchema>

// --- Content Blocks (discriminated union by `type`) ---
export const journeySimpleBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    text: z.string(),
    variant: z
      .enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
      .optional()
      .default('h3')
  }),
  z.object({
    type: z.literal('text'),
    text: z.string(),
    variant: z
      .enum([
        'body1',
        'body2',
        'subtitle1',
        'subtitle2',
        'caption',
        'overline'
      ])
      .optional()
      .default('body1')
  }),
  z.object({
    type: z.literal('button'),
    text: z.string().describe('Label displayed on the button.'),
    action: journeySimpleActionSchema
  }),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string(),
    width: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Omit — server computes from URL.'),
    height: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Omit — server computes from URL.'),
    blurhash: z.string().optional().describe('Omit — server computes from URL.')
  }),
  z.object({
    type: z.literal('video'),
    url: z.string().describe('YouTube URL.'),
    startAt: z.number().int().nonnegative().optional(),
    endAt: z.number().int().positive().optional()
  }),
  z.object({
    type: z.literal('poll'),
    gridView: z.boolean().optional().default(false),
    options: z
      .array(
        z.object({
          text: z.string(),
          action: journeySimpleActionSchema.optional()
        })
      )
      .min(2)
  }),
  z.object({
    type: z.literal('multiselect'),
    min: z.number().int().nonnegative().optional(),
    max: z.number().int().positive().optional(),
    options: z.array(z.string()).min(2)
  }),
  z.object({
    type: z.literal('textInput'),
    label: z.string(),
    inputType: z
      .enum(['freeForm', 'name', 'email', 'phone'])
      .optional()
      .default('freeForm'),
    placeholder: z.string().optional(),
    hint: z.string().optional(),
    required: z.boolean().optional().default(false)
  }),
  z.object({
    type: z.literal('spacer'),
    spacing: z
      .number()
      .int()
      .positive()
      .describe('Vertical spacing in pixels.')
  })
])

export type JourneySimpleBlock = z.infer<typeof journeySimpleBlockSchema>

// --- Image Schema (for backgroundImage) ---
export const journeySimpleImageSchema = z.object({
  src: z.string().describe('A URL for the image.'),
  alt: z.string().describe('Alt text for the image for accessibility.'),
  width: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Omit — server computes from URL.'),
  height: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Omit — server computes from URL.'),
  blurhash: z.string().optional().describe('Omit — server computes from URL.')
})

export type JourneySimpleImage = z.infer<typeof journeySimpleImageSchema>

// --- Card Schema ---
export const journeySimpleCardSchema = z.object({
  id: z.string().describe(
    'Unique, semantic identifier. Use descriptive names like "card-welcome" or "card-results". Do NOT use positional names like "card-1".'
  ),
  x: z
    .number()
    .optional()
    .describe('Canvas x position. Omit to auto-layout (index * 300).'),
  y: z
    .number()
    .optional()
    .describe('Canvas y position. Omit to default to 0.'),
  backgroundColor: z
    .string()
    .optional()
    .describe('Hex color for the card background e.g. "#1A1A2E".'),
  backgroundImage: journeySimpleImageSchema.optional(),
  backgroundVideo: z
    .object({
      url: z.string().describe('YouTube URL.'),
      startAt: z.number().int().nonnegative().optional(),
      endAt: z.number().int().positive().optional()
    })
    .optional(),
  content: z
    .array(journeySimpleBlockSchema)
    .describe('Ordered array of content blocks on this card.'),
  defaultNextCard: z.string().optional()
})

export type JourneySimpleCard = z.infer<typeof journeySimpleCardSchema>

// --- Journey Schema ---
export const journeySimpleSchema = z.object({
  title: z.string().describe('The title of the journey.'),
  description: z.string().describe('A description of the journey.'),
  cards: z
    .array(journeySimpleCardSchema)
    .describe('An array of cards that make up the journey.')
})

export type JourneySimple = z.infer<typeof journeySimpleSchema>

// --- Write schema (adds cross-card reference validation + video/background rules) ---
export const journeySimpleSchemaUpdate = journeySimpleSchema.superRefine(
  (data, ctx) => {
    const cardIds = new Set(data.cards.map((c) => c.id))

    for (const card of data.cards) {
      const cardIndex = data.cards.indexOf(card)

      // Cross-card reference validation
      const checkRef = (ref: string | undefined, path: string): void => {
        if (ref && !cardIds.has(ref)) {
          ctx.addIssue({
            code: 'custom',
            path: ['cards', cardIndex, path],
            message: `Card "${ref}" does not exist. Valid IDs: ${Array.from(cardIds).join(', ')}`
          })
        }
      }

      checkRef(card.defaultNextCard, 'defaultNextCard')

      for (const block of card.content) {
        if (block.type === 'button' && block.action.kind === 'navigate') {
          checkRef(block.action.cardId, 'content[button].action.cardId')
        }
        if (block.type === 'poll') {
          block.options.forEach((o, i) => {
            if (o.action?.kind === 'navigate') {
              checkRef(
                o.action.cardId,
                `content[poll].options[${i}].action.cardId`
              )
            }
          })
        }
      }

      // Video/background rules
      const hasContentVideo = card.content.some((b) => b.type === 'video')
      const hasBgImage = card.backgroundImage != null
      const hasBgVideo = card.backgroundVideo != null

      if (hasContentVideo && card.content.length > 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['cards', cardIndex, 'content'],
          message: 'Video content must be the only content block on a card.'
        })
      }
      if (hasContentVideo && (hasBgImage || hasBgVideo)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cards', cardIndex],
          message:
            'Video content cards cannot have background image or background video.'
        })
      }
      if (hasBgImage && hasBgVideo) {
        ctx.addIssue({
          code: 'custom',
          path: ['cards', cardIndex],
          message:
            'Card cannot have both backgroundImage and backgroundVideo.'
        })
      }
    }
  }
)

export type JourneySimpleUpdate = z.infer<typeof journeySimpleSchemaUpdate>
