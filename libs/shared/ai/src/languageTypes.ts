import { z } from 'zod'

// --- Language Schema ---
export const languageSchema = z.object({
  id: z.string().describe('The unique identifier for the language.'),
  slug: z.string().describe('The slug identifier for the language.')
})

export type Language = z.infer<typeof languageSchema>

// --- Language Response Schema ---
export const languageResponseSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  data: z.array(languageSchema).optional().describe('Array of language data if successful.'),
  errors: z.array(z.object({
    message: z.string().describe('Error message.')
  })).optional().describe('Array of error messages if the operation failed.')
})

export type LanguageResponse = z.infer<typeof languageResponseSchema>