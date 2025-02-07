import { z } from 'zod'

export const JourneyGenerationInputSchema = z.object({
  theme: z.string().min(1),
  targetAudience: z.string().min(1),
  mainMessage: z.string().min(1),
  language: z.string().default('529'), // Default to English
  additionalContext: z.string().optional(),
  systemPrompt: z.string().optional()
})

export const TemplateSelectionSchema = z.object({
  templateId: z.string(),
  confidenceScore: z.number().min(0).max(1),
  reasonForSelection: z.string()
})

export const TheologicalValidationSchema = z.object({
  isValid: z.boolean(),
  concerns: z.array(z.string()),
  suggestions: z.array(z.string())
})

export type JourneyGenerationInput = z.infer<
  typeof JourneyGenerationInputSchema
>
export type TemplateSelection = z.infer<typeof TemplateSelectionSchema>
export type TheologicalValidation = z.infer<typeof TheologicalValidationSchema>
