import { Output, generateText } from 'ai'
import { z } from 'zod'

import type { OpenrouterFallbackSession } from '@core/shared/ai/openrouterModel'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

export const TRANSLATION_SYSTEM_PROMPT = `${preSystemPrompt}

You are a professional translator for interactive journey content.
- Translate accurately while being culturally appropriate for the target language
- Keep UI text (button labels, placeholders) concise and natural
- Preserve all {{variable}} template syntax exactly as-is — never translate content inside {{ }}
- For Bible passages, use an established translation in the target language — never translate scripture yourself. If none is identified, use the most popular English Bible translation.
- DO NOT translate proper nouns`

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
Do not translate anything yet — produce only the analysis.

Journey Title: ${hardenPrompt(journeyTitle)}
${hasDescription ? `Journey Description: ${hardenPrompt(journeyDescription)}` : '(No description provided)'}
${seoTitle ? `SEO Title: ${hardenPrompt(seoTitle)}` : '(No SEO title provided)'}
${seoDescription ? `SEO Description: ${hardenPrompt(seoDescription)}` : '(No SEO description provided)'}

Journey Content:
${hardenPrompt(cardBlocksContent.join('\n'))}`
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
  const prompt = `Context from journey analysis:
${hardenPrompt(journeyAnalysis)}

Translate the ${fieldName} below from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.
Return only the translated text — no field labels, no surrounding quotes, no extra commentary.

${fieldName}:
${hardenPrompt(value)}`

  const { output } = await session.execute((model, abortSignal) =>
    generateText({
      model,
      abortSignal,
      maxRetries: 0,
      messages: [
        { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }]
        }
      ],
      output: Output.object({ schema: JourneyFieldTranslationSchema })
    })
  )

  return cleanFieldOutput(output.translation)
}

export interface JourneyMetadataTranslation {
  analysis: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
}

/**
 * Analyzes a journey and translates its title, description, and SEO fields.
 *
 * The journey-wide analysis is generated once and reused as shared context.
 * Each metadata field is then translated in its own single-field call so the
 * model cannot swap values between fields. Fields that have no source value
 * resolve to an empty string without an AI call.
 */
export async function translateJourneyMetadata({
  sourceLanguageName,
  targetLanguageName,
  journeyTitle,
  journeyDescription,
  seoTitle,
  seoDescription,
  cardBlocksContent,
  session
}: {
  sourceLanguageName: string
  targetLanguageName: string
  journeyTitle: string
  journeyDescription: string | null
  seoTitle: string | null
  seoDescription: string | null
  cardBlocksContent: string[]
  session: OpenrouterFallbackSession
}): Promise<JourneyMetadataTranslation> {
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

  const { output: analysisOutput } = await session.execute(
    (model, abortSignal) =>
      generateText({
        model,
        abortSignal,
        maxRetries: 0,
        messages: [
          { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [{ type: 'text', text: analysisPrompt }]
          }
        ],
        output: Output.object({ schema: JourneyAnalysisSchema })
      })
  )

  const analysis = analysisOutput.analysis

  const [title, description, translatedSeoTitle, translatedSeoDescription] =
    await Promise.all([
      translateJourneyField({
        fieldName: 'journey title',
        value: journeyTitle,
        sourceLanguageName,
        targetLanguageName,
        journeyAnalysis: analysis,
        session
      }),
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
    description,
    seoTitle: translatedSeoTitle,
    seoDescription: translatedSeoDescription
  }
}
