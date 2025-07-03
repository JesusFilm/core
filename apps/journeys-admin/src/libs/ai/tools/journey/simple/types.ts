import { z } from 'zod'

// ============================
// Simplified Journey Types
// ============================

export interface ContentItem {
  type: 'heading' | 'text' | 'button' | 'image' | 'background-image'
  text?: string
  level?: number // For heading level (1-6)
  action?: string // For button actions
  src?: string // For images
  alt?: string // For image alt text
}

export interface SimplifiedStep {
  id: string
  content: ContentItem[]
  nextStep?: string
  backgroundColor?: string
}

export interface SimplifiedJourney {
  journey: {
    title: string
    description?: string
    theme: {
      mode: 'light' | 'dark'
      name: 'base'
    }
    settings?: {
      showShareButton: boolean
      showLikeButton: boolean
      website: boolean
    }
  }
  steps: SimplifiedStep[]
}

// ============================
// Zod Schemas
// ============================

const contentItemSchema = z.object({
  type: z
    .enum(['heading', 'text', 'button', 'image', 'background-image'])
    .describe('Type of content element'),
  text: z
    .string()
    .optional()
    .describe('Text content for headings, text, and buttons'),
  level: z
    .number()
    .min(1)
    .max(6)
    .optional()
    .describe('Heading level (1-6, where 1 is largest)'),
  action: z
    .string()
    .optional()
    .describe('Button action (e.g., "next", "back", or navigation target)'),
  src: z.string().optional().describe('Image URL'),
  alt: z.string().optional().describe('Image alt text for accessibility')
}) satisfies z.ZodType<ContentItem>

const simplifiedStepSchema = z.object({
  id: z.string().describe('Unique identifier for this step'),
  content: z
    .array(contentItemSchema)
    .describe('Array of content elements in this step'),
  nextStep: z
    .string()
    .optional()
    .describe('ID of the next step to navigate to'),
  backgroundColor: z
    .string()
    .optional()
    .describe('Background color for this step (hex color)')
}) satisfies z.ZodType<SimplifiedStep>

export const simplifiedJourneySchema = z.object({
  journey: z
    .object({
      title: z.string().describe('Journey title displayed to users'),
      description: z.string().optional().describe('Journey description'),
      theme: z
        .object({
          mode: z.enum(['light', 'dark']).describe('Visual theme mode'),
          name: z.literal('base').describe('Theme name')
        })
        .describe('Journey visual theme settings'),
      settings: z
        .object({
          showShareButton: z.boolean().describe('Whether to show share button'),
          showLikeButton: z.boolean().describe('Whether to show like button'),
          website: z.boolean().describe('Whether journey is web-accessible')
        })
        .optional()
        .describe('Journey display settings')
    })
    .describe('Journey metadata and configuration'),
  steps: z
    .array(simplifiedStepSchema)
    .describe('Array of journey steps in order')
}) satisfies z.ZodType<SimplifiedJourney>

// ============================
// Tool Parameter Types
// ============================

export interface GetSimpleJourneyParams {
  journeyId: string
}

export interface SendSimpleJourneyParams {
  journeyId: string
  journey: SimplifiedJourney
}

// ============================
// Parameter Schemas
// ============================

export const getSimpleJourneyParamsSchema = z.object({
  journeyId: z.string().uuid().describe('Unique ID of the journey to retrieve')
}) satisfies z.ZodType<GetSimpleJourneyParams>

export const sendSimpleJourneyParamsSchema = z.object({
  journeyId: z.string().uuid().describe('Unique ID of the journey to update'),
  journey: simplifiedJourneySchema.describe('Complete journey data to save')
}) satisfies z.ZodType<SendSimpleJourneyParams>
