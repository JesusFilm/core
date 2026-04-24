import { Output, generateText } from 'ai'
import { z } from 'zod'

import { JourneyCustomizationField } from '@core/prisma/journeys/client'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'
import { withGeminiFallback } from '@core/shared/ai/geminiModel'

const CUSTOMIZATION_SYSTEM_PROMPT = `${preSystemPrompt}

You are a professional translation engine.
- Translate text accurately while preserving meaning and cultural appropriateness
- DO NOT translate addresses (street addresses, city names, postal codes, country names)
- Preserve numeric time formats (e.g. "3:00 PM", "14:30") but localize month and weekday names as appropriate
- DO NOT translate locations (place names, venue names, building names)
- DO NOT translate proper nouns (names of people, organizations, brands)
- Maintain the original format and structure`

const BatchTranslationSchema = z.object({
  translations: z
    .array(z.string())
    .describe('Translated texts in the same order as the input values')
})

const CustomizationDescriptionTranslationSchema = z.object({
  translatedDescription: z
    .string()
    .describe(
      'Translated customization description with all {{ ... }} blocks preserved verbatim'
    )
})

/**
 * Translates multiple values in a single AI call.
 * Far more efficient than individual translateValue calls when handling multiple fields.
 */
async function translateBatch({
  values,
  sourceLanguageName,
  targetLanguageName,
  journeyAnalysis
}: {
  values: string[]
  sourceLanguageName: string
  targetLanguageName: string
  journeyAnalysis?: string
}): Promise<string[]> {
  if (values.length === 0) return []

  const numberedValues = values
    .map((v, i) => `${i + 1}. ${hardenPrompt(v)}`)
    .join('\n')

  const prompt = `${journeyAnalysis ? `Context:\n${hardenPrompt(journeyAnalysis)}\n\n` : ''}Translate each value from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.
Return translations in the same order as input.

${numberedValues}`

  const { output } = await withGeminiFallback((model) =>
    generateText({
      model,
      messages: [
        { role: 'system', content: CUSTOMIZATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }]
        }
      ],
      output: Output.object({ schema: BatchTranslationSchema })
    })
  )

  return values.map((original, i) => output.translations[i] ?? original)
}

/**
 * Translates a single value using AI.
 * Prefer translateBatch when translating multiple values.
 */
export async function translateValue({
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
  const [result] = await translateBatch({
    values: [value],
    sourceLanguageName,
    targetLanguageName,
    journeyAnalysis
  })
  return result
}

/**
 * Translates customization fields and description.
 * - Batches all field values into a single AI call per target language
 * - Batches all field defaultValues into a single AI call
 * - Translates description separately (has unique preservation requirements)
 * - All {{ ... }} blocks in the description are preserved verbatim
 *
 * @param journeyCustomizationDescription - The customization description string
 * @param journeyCustomizationFields - Array of customization field objects
 * @param sourceLanguageName - Source language name
 * @param targetLanguageName - Target language name for field values
 * @param descriptionTargetLanguageName - Target language name for description text outside \{\{ \}\} (falls back to targetLanguageName)
 * @param defaultValueTargetLanguageName - Target language name for default values (falls back to targetLanguageName)
 * @param journeyAnalysis - Optional journey analysis context for better translation
 * @returns Object with translated description and fields
 */
export async function translateCustomizationFields({
  journeyCustomizationDescription,
  journeyCustomizationFields,
  sourceLanguageName,
  targetLanguageName,
  descriptionTargetLanguageName,
  defaultValueTargetLanguageName,
  journeyAnalysis
}: {
  journeyCustomizationDescription: string | null
  journeyCustomizationFields: JourneyCustomizationField[]
  sourceLanguageName: string
  targetLanguageName: string
  descriptionTargetLanguageName?: string
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
  const effectiveDescriptionTarget =
    descriptionTargetLanguageName ?? targetLanguageName
  const effectiveDefaultValueTarget =
    defaultValueTargetLanguageName ?? targetLanguageName

  const hasNonBlank = (v: string | null): v is string =>
    typeof v === 'string' && v.trim().length > 0

  const fieldsWithContent = journeyCustomizationFields.filter(
    (field) => hasNonBlank(field.value) || hasNonBlank(field.defaultValue)
  )

  const hasDescription = hasNonBlank(journeyCustomizationDescription)

  if (fieldsWithContent.length === 0 && !hasDescription) {
    return { translatedDescription: null, translatedFields: [] }
  }

  const valueEntries = fieldsWithContent
    .map((f, i) => ({ index: i, text: f.value }))
    .filter((e): e is { index: number; text: string } => hasNonBlank(e.text))

  const defaultValueEntries = fieldsWithContent
    .map((f, i) => ({ index: i, text: f.defaultValue }))
    .filter((e): e is { index: number; text: string } => hasNonBlank(e.text))

  const [translatedValues, translatedDefaults, translatedDescription] =
    await Promise.all([
      valueEntries.length > 0
        ? translateBatch({
            values: valueEntries.map((e) => e.text),
            sourceLanguageName,
            targetLanguageName,
            journeyAnalysis
          })
        : Promise.resolve([] as string[]),

      defaultValueEntries.length > 0
        ? translateBatch({
            values: defaultValueEntries.map((e) => e.text),
            sourceLanguageName,
            targetLanguageName: effectiveDefaultValueTarget,
            journeyAnalysis
          })
        : Promise.resolve([] as string[]),

      hasDescription
        ? translateCustomizationDescription({
            description: journeyCustomizationDescription,
            sourceLanguageName,
            targetLanguageName: effectiveDescriptionTarget,
            journeyAnalysis
          })
        : Promise.resolve(null)
    ])

  const valueMap = new Map<number, string>()
  valueEntries.forEach((entry, i) => {
    valueMap.set(entry.index, translatedValues[i])
  })

  const defaultValueMap = new Map<number, string>()
  defaultValueEntries.forEach((entry, i) => {
    defaultValueMap.set(entry.index, translatedDefaults[i])
  })

  const translatedFields = fieldsWithContent.map((field, i) => ({
    id: field.id,
    key: field.key,
    translatedValue: valueMap.get(i) ?? null,
    translatedDefaultValue: defaultValueMap.get(i) ?? null
  }))

  return { translatedDescription, translatedFields }
}

/**
 * Translates customization description while preserving all {{ ... }} blocks verbatim.
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
  const fieldPattern =
    /\{\{\s*([^:}]+)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}/g

  const fieldMatches: string[] = []
  let match
  while ((match = fieldPattern.exec(description)) !== null) {
    fieldMatches.push(match[0])
  }

  const fieldContext =
    fieldMatches.length > 0
      ? `\nThese {{ }} blocks must be preserved EXACTLY as-is:\n${fieldMatches.map((m, i) => `${i + 1}. "${m}"`).join('\n')}\n`
      : ''

  const prompt = `${journeyAnalysis ? `Context:\n${hardenPrompt(journeyAnalysis)}\n\n` : ''}Translate this customization description from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

CRITICAL: Preserve ALL {{ }} blocks exactly as-is — do not translate, modify, or rewrite anything inside double curly braces.
Only translate text outside {{ }} brackets.
${fieldContext}
Description:
${hardenPrompt(description)}`

  const { output } = await withGeminiFallback((model) =>
    generateText({
      model,
      messages: [
        { role: 'system', content: CUSTOMIZATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }]
        }
      ],
      output: Output.object({
        schema: CustomizationDescriptionTranslationSchema
      })
    })
  )

  if (fieldMatches.length > 0) {
    const translatedTokens: string[] = []
    const verifyPattern =
      /\{\{\s*([^:}]+)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}/g
    let verifyMatch
    while (
      (verifyMatch = verifyPattern.exec(output.translatedDescription)) !== null
    ) {
      translatedTokens.push(verifyMatch[0])
    }

    const tokensPreserved =
      fieldMatches.length === translatedTokens.length &&
      fieldMatches.every((token, i) => token === translatedTokens[i])

    if (!tokensPreserved) {
      console.warn(
        'Customization description translation mangled {{ }} tokens, falling back to original',
        { expected: fieldMatches, got: translatedTokens }
      )
      return description
    }
  }

  return output.translatedDescription
}
