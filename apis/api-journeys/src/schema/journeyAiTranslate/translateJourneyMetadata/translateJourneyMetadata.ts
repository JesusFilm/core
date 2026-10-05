import { Output, generateText } from 'ai'
import { z } from 'zod'

import {
  AiRequestTimeoutError,
  type OpenrouterFallbackSession
} from '@core/shared/ai/openrouterModel'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { logger } from '../../../logger'

export const TRANSLATION_SYSTEM_PROMPT = `${preSystemPrompt}

You are a professional translator for interactive journey content.
- Translate accurately while being culturally appropriate for the target language
- Keep UI text (button labels, placeholders) concise and natural
- Preserve all {{variable}} template syntax exactly as-is — never translate content inside {{ }}
- For Bible passages, use an established translation in the target language — never translate scripture yourself. If none is identified, use the most popular English Bible translation.
- DO NOT translate proper nouns`

/**
 * How many times one structured-output call is attempted before the metadata
 * step gives up on it.
 *
 * Mirrors the card path's batch attempts. The model occasionally answers a
 * single-field call with prose instead of the requested JSON object, or with
 * nothing at all; a fresh sample nearly always lands, and without a retry one
 * bad sample used to abandon the whole translation.
 */
export const MAX_METADATA_ATTEMPTS = 3

/**
 * Strips field-label prefixes and formatting artifacts that some models
 * echo back into structured-output string fields.
 */
export function cleanFieldOutput(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(
    /^(?:Journey\s+Title|Journey\s+Description|SEO\s+Title|SEO\s+Description)\s*[:：]\s*/i,
    ''
  )
  cleaned = cleaned.replace(/^["'"'«»]+|["'"'«»]+$/g, '')
  return cleaned.trim()
}

const JourneyAnalysisSchema = z.object({
  analysis: z
    .string()
    .describe(
      'Analysis of journey themes, target audience, cultural considerations, and identified Bible translation for the target language'
    )
})

const JourneyFieldTranslationSchema = z.object({
  translation: z
    .string()
    .describe(
      'Only the translated text for the requested field. No field labels, no surrounding quotes, no commentary.'
    )
})

/**
 * The prompts below spell out the JSON object each call must return, in the
 * schema's own field names. The AI SDK sends the schema only as request
 * metadata (`response_format`) and adds nothing to the prompt text, so when a
 * serving host does not enforce that metadata the model follows the words it
 * was given. A prompt that said "return only the translated text" while the
 * request asked for `{ "translation": "..." }` produced bare text on exactly
 * those hosts; naming the shape in the prompt keeps the two in agreement.
 */
function buildAnalysisPrompt({
  sourceLanguageName,
  targetLanguageName,
  journeyTitle,
  journeyDescription,
  seoTitle,
  seoDescription,
  cardBlocksContent
}: {
  sourceLanguageName: string
  targetLanguageName: string
  journeyTitle: string
  journeyDescription: string
  seoTitle: string
  seoDescription: string
  cardBlocksContent: string[]
}): string {
  const hasDescription = Boolean(journeyDescription)

  return `Analyze this journey to prepare for translating it from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Identify themes, target audience, and cultural adaptation needs.
If the content references the Bible, identify the most appropriate Bible translation in the target language.
Do not translate anything yet.

Journey Title: ${hardenPrompt(journeyTitle)}
${hasDescription ? `Journey Description: ${hardenPrompt(journeyDescription)}` : '(No description provided)'}
${seoTitle ? `SEO Title: ${hardenPrompt(seoTitle)}` : '(No SEO title provided)'}
${seoDescription ? `SEO Description: ${hardenPrompt(seoDescription)}` : '(No SEO description provided)'}

Journey Content:
${hardenPrompt(cardBlocksContent.join('\n'))}

Respond with a JSON object of exactly this shape:
{"analysis": "<your analysis>"}

The "analysis" value must contain only the analysis — no translations, no commentary.`
}

function buildFieldPrompt({
  fieldName,
  value,
  sourceLanguageName,
  targetLanguageName,
  journeyAnalysis
}: {
  fieldName: string
  value: string
  sourceLanguageName: string
  targetLanguageName: string
  journeyAnalysis: string
}): string {
  return `Context from journey analysis:
${hardenPrompt(journeyAnalysis)}

Translate the ${fieldName} below from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

${fieldName}:
${hardenPrompt(value)}

Respond with a JSON object of exactly this shape:
{"translation": "<the translated ${fieldName}>"}

The "translation" value must contain only the translated text — no field labels, no commentary, nothing but the translation itself.`
}

/**
 * Runs one structured-output call through the fallback session, retrying the
 * whole call on failure up to {@link MAX_METADATA_ATTEMPTS}.
 *
 * The session itself only moves to the next model on a timeout, a 429, or a
 * 403. A malformed answer — prose where a JSON object was requested, or no
 * output at all — is none of those, so it used to escape straight to the
 * caller and fail the translation. This loop is the metadata equivalent of
 * the card path's retry loop.
 *
 * Timeouts are not retried: by the time one surfaces the session has already
 * walked its whole model chain, and another attempt would only wait again.
 */
async function generateObjectWithRetry<T>({
  label,
  prompt,
  schema,
  session
}: {
  label: string
  prompt: string
  schema: z.ZodType<T>
  session: OpenrouterFallbackSession
}): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_METADATA_ATTEMPTS; attempt++) {
    try {
      return await session.execute(async (model, abortSignal) => {
        const result = await generateText({
          model,
          abortSignal,
          maxRetries: 0,
          instructions: TRANSLATION_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [{ type: 'text', text: prompt }]
            }
          ],
          output: Output.object({ schema })
        })
        // `output` is a getter that throws when the model produced nothing.
        // Read it inside the operation so that failure belongs to this
        // attempt rather than surfacing after the session has returned.
        return result.output
      })
    } catch (error) {
      if (error instanceof AiRequestTimeoutError) throw error
      lastError = error
      logger.warn(
        { error, label, attempt, maxAttempts: MAX_METADATA_ATTEMPTS },
        'Journey metadata AI call failed'
      )
    }
  }
  throw lastError
}

/**
 * Translates a single journey metadata field in its own AI call.
 *
 * Isolating each field to its own call is what prevents a weaker model from
 * swapping one field's value into another field's slot (e.g. the journey
 * description landing in the title): the prompt only ever contains the one
 * value being translated, so there is no sibling field to confuse it with.
 */
async function translateJourneyField({
  fieldName,
  value,
  sourceLanguageName,
  targetLanguageName,
  journeyAnalysis,
  session
}: {
  fieldName: string
  value: string
  sourceLanguageName: string
  targetLanguageName: string
  journeyAnalysis: string
  session: OpenrouterFallbackSession
}): Promise<string> {
  const { translation } = await generateObjectWithRetry({
    label: fieldName,
    prompt: buildFieldPrompt({
      fieldName,
      value,
      sourceLanguageName,
      targetLanguageName,
      journeyAnalysis
    }),
    schema: JourneyFieldTranslationSchema,
    session
  })

  return cleanFieldOutput(translation)
}

export interface JourneyMetadataTranslation {
  analysis: string
  title: string
  displayTitle: string
  description: string
  seoTitle: string
  seoDescription: string
}

/**
 * Analyzes a journey and translates its title, description, and SEO fields.
 *
 * The journey-wide analysis is generated once and reused as shared context.
 * Each metadata field is then translated in its own single-field call so the
 * model cannot swap values between fields. Every call is retried on a
 * malformed answer before the step fails. Fields that have no source value
 * resolve to an empty string without an AI call.
 */
export async function translateJourneyMetadata({
  sourceLanguageName,
  targetLanguageName,
  journeyTitle,
  journeyDisplayTitle,
  journeyDescription,
  seoTitle,
  seoDescription,
  cardBlocksContent,
  session
}: {
  sourceLanguageName: string
  targetLanguageName: string
  journeyTitle: string
  journeyDisplayTitle: string | null
  journeyDescription: string | null
  seoTitle: string | null
  seoDescription: string | null
  cardBlocksContent: string[]
  session: OpenrouterFallbackSession
}): Promise<JourneyMetadataTranslation> {
  const trimmedDisplayTitle = journeyDisplayTitle?.trim() ?? ''
  const trimmedDescription = journeyDescription?.trim() ?? ''
  const trimmedSeoTitle = seoTitle?.trim() ?? ''
  const trimmedSeoDescription = seoDescription?.trim() ?? ''

  const analysisPrompt = buildAnalysisPrompt({
    sourceLanguageName,
    targetLanguageName,
    journeyTitle,
    journeyDescription: trimmedDescription,
    seoTitle: trimmedSeoTitle,
    seoDescription: trimmedSeoDescription,
    cardBlocksContent
  })

  const { analysis } = await generateObjectWithRetry({
    label: 'journey analysis',
    prompt: analysisPrompt,
    schema: JourneyAnalysisSchema,
    session
  })

  const [
    title,
    displayTitle,
    description,
    translatedSeoTitle,
    translatedSeoDescription
  ] = await Promise.all([
    translateJourneyField({
      fieldName: 'journey title',
      value: journeyTitle,
      sourceLanguageName,
      targetLanguageName,
      journeyAnalysis: analysis,
      session
    }),
    trimmedDisplayTitle
      ? translateJourneyField({
          fieldName: 'journey display title',
          value: trimmedDisplayTitle,
          sourceLanguageName,
          targetLanguageName,
          journeyAnalysis: analysis,
          session
        })
      : Promise.resolve(''),
    trimmedDescription
      ? translateJourneyField({
          fieldName: 'journey description',
          value: trimmedDescription,
          sourceLanguageName,
          targetLanguageName,
          journeyAnalysis: analysis,
          session
        })
      : Promise.resolve(''),
    trimmedSeoTitle
      ? translateJourneyField({
          fieldName: 'SEO title',
          value: trimmedSeoTitle,
          sourceLanguageName,
          targetLanguageName,
          journeyAnalysis: analysis,
          session
        })
      : Promise.resolve(''),
    trimmedSeoDescription
      ? translateJourneyField({
          fieldName: 'SEO description',
          value: trimmedSeoDescription,
          sourceLanguageName,
          targetLanguageName,
          journeyAnalysis: analysis,
          session
        })
      : Promise.resolve('')
  ])

  return {
    analysis,
    title,
    displayTitle,
    description,
    seoTitle: translatedSeoTitle,
    seoDescription: translatedSeoDescription
  }
}
