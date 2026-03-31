import { google } from '@ai-sdk/google'
import { Output, generateText } from 'ai'
import { z } from 'zod'

import { JourneyCustomizationField } from '@core/prisma/journeys/client'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

/**
 * Schema for customization field translation response
 */
const CustomizationFieldTranslationSchema = z.object({
  translatedValue: z
    .string()
    .describe('Translated value for the customization field')
})

/**
 * Schema for customization description translation response
 */
const CustomizationDescriptionTranslationSchema = z.object({
  translatedDescription: z
    .string()
    .describe(
      'Translated customization description with all {{ ... }} blocks preserved verbatim'
    )
})

/**
 * Extracts and translates customization fields and description.
 * - Translates field values to targetLanguageName (user-facing customization text)
 * - Translates field defaultValues to defaultValueTargetLanguageName (journey content language),
 *   falling back to targetLanguageName if not provided
 * - All {{ ... }} blocks in the description are preserved verbatim (no conversion or rewriting)
 * - Does NOT translate addresses, times, or locations
 * - Only translates text outside of {{ }} brackets in the description
 *
 * @param journeyCustomizationDescription - The customization description string
 * @param journeyCustomizationFields - Array of customization field objects
 * @param sourceLanguageName - Source language name
 * @param targetLanguageName - Target language name for values and description
 * @param defaultValueTargetLanguageName - Target language name for default values (falls back to targetLanguageName)
 * @param journeyAnalysis - Optional journey analysis context for better translation
 * @returns Object with translated description and fields
 */
export async function translateCustomizationFields({
  journeyCustomizationDescription,
  journeyCustomizationFields,
  sourceLanguageName,
  targetLanguageName,
  defaultValueTargetLanguageName,
  journeyAnalysis
}: {
  journeyCustomizationDescription: string | null
  journeyCustomizationFields: JourneyCustomizationField[]
  sourceLanguageName: string
  targetLanguageName: string
  defaultValueTargetLanguageName?: string
  journeyAnalysis?: string
}): Promise<{
  translatedDescription: string | null
  translatedFields: Array<{
    id: string
    key: string
    translatedValue: string | null
    translatedDefaultValue: string | null
  }>
}> {
  const effectiveDefaultValueTarget =
    defaultValueTargetLanguageName ?? targetLanguageName

  // Extract values that need translation from fields
  const valuesToTranslate: Array<{
    id: string
    key: string
    value: string | null
    defaultValue: string | null
  }> = []

  for (const field of journeyCustomizationFields) {
    if (field.value || field.defaultValue) {
      valuesToTranslate.push({
        id: field.id,
        key: field.key,
        value: field.value,
        defaultValue: field.defaultValue
      })
    }
  }

  // Translate field values
  const translatedFields = await Promise.all(
    valuesToTranslate.map(async (field) => {
      const translatedValue = field.value
        ? await translateValue({
            value: field.value,
            sourceLanguageName,
            targetLanguageName,
            journeyAnalysis
          })
        : null

      const translatedDefaultValue = field.defaultValue
        ? await translateValue({
            value: field.defaultValue,
            sourceLanguageName,
            targetLanguageName: effectiveDefaultValueTarget,
            journeyAnalysis
          })
        : null

      return {
        id: field.id,
        key: field.key,
        translatedValue,
        translatedDefaultValue
      }
    })
  )

  // Translate description while preserving all {{ ... }} blocks verbatim
  let translatedDescription: string | null = null
  if (journeyCustomizationDescription) {
    translatedDescription = await translateCustomizationDescription({
      description: journeyCustomizationDescription,
      sourceLanguageName,
      targetLanguageName,
      journeyAnalysis
    })
  }

  return {
    translatedDescription,
    translatedFields
  }
}

/**
 * Translates a single value using AI
 * Does NOT translate addresses, times, or locations
 */
async function translateValue({
  value,
  sourceLanguageName,
  targetLanguageName,
  journeyAnalysis
}: {
  value: string
  sourceLanguageName: string
  targetLanguageName: string
  journeyAnalysis?: string
}): Promise<string> {
  const prompt = `
${journeyAnalysis ? `JOURNEY ANALYSIS AND ADAPTATION SUGGESTIONS:\n${hardenPrompt(journeyAnalysis)}\n\n` : ''}
Translate the following value from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

IMPORTANT RULES:
- DO NOT translate addresses (street addresses, city names, postal codes, country names)
- DO NOT translate times (time formats like "3:00 PM", "14:30", "Monday", "January", etc.)
- DO NOT translate locations (place names, venue names, building names, etc.)
- DO NOT translate proper nouns (names of people, organizations, brands, etc.)
- Only translate general descriptive text, instructions, and common phrases
- Maintain the same format and structure as the original

Value to translate: ${hardenPrompt(value)}

Return only the translated value, maintaining the same meaning and cultural appropriateness.
`

  const { output } = await generateText({
    model: google('gemini-2.5-flash'),
    messages: [
      {
        role: 'system',
        content: preSystemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ],
    output: Output.object({
      schema: CustomizationFieldTranslationSchema
    })
  })

  return output.translatedValue
}

/**
 * Translates customization description while preserving all {{ ... }} blocks verbatim.
 * All {{ key }} and {{ key: value }} blocks are preserved exactly as-is without any conversion or rewriting.
 * Only text outside of {{ }} brackets is translated.
 */
export async function translateCustomizationDescription({
  description,
  sourceLanguageName,
  targetLanguageName,
  journeyAnalysis
}: {
  description: string
  sourceLanguageName: string
  targetLanguageName: string
  journeyAnalysis?: string
}): Promise<string> {
  // Pattern to match {{ key }} and {{ key: value }} formats for identification only
  // These blocks will be preserved verbatim in the translation
  const fieldPattern =
    /\{\{\s*([^:}]+)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}/g

  // Extract all field references to provide context to the AI
  // All {{ ... }} blocks will be preserved verbatim (no translation or modification)
  const fieldMatches: Array<{
    fullMatch: string
    key: string
    value: string | null
  }> = []

  let match
  while ((match = fieldPattern.exec(description)) !== null) {
    const key = match[1].trim()
    const quotedValue = match[3]
    const unquotedValue = match[4]
    const value =
      quotedValue !== undefined
        ? quotedValue
        : unquotedValue !== undefined
          ? unquotedValue.trim()
          : null

    fieldMatches.push({
      fullMatch: match[0],
      key,
      value
    })
  }

  // Build translation context listing all {{ ... }} blocks that must be preserved verbatim
  // The AI will be instructed to copy these exactly as-is without any changes
  const fieldContext = fieldMatches
    .map((field, index) => {
      return `Field ${index + 1}: "${field.fullMatch}"`
    })
    .join('\n')

  const prompt = `
${journeyAnalysis ? `JOURNEY ANALYSIS AND ADAPTATION SUGGESTIONS:\n${hardenPrompt(journeyAnalysis)}\n\n` : ''}
Translate the following customization description from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

CRITICAL RULES - READ CAREFULLY:
1. PRESERVE EVERYTHING inside double curly braces {{ }} EXACTLY as-is, do not translate or modify - this is the MOST IMPORTANT rule
2. DO NOT translate proper nouns (names of people, organizations, brands, etc.)
3. Only translate text that is completely OUTSIDE the {{ }} brackets
4. Maintain all other text formatting and structure

Customization fields in the text:
${hardenPrompt(fieldContext)}

Description to translate:
${hardenPrompt(description)}
`

  const { output } = await generateText({
    model: google('gemini-2.0-flash'),
    messages: [
      {
        role: 'system',
        content: preSystemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ],
    output: Output.object({
      schema: CustomizationDescriptionTranslationSchema
    })
  })

  return output.translatedDescription
}
