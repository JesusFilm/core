import { SubtitleAIInput } from './types'

const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions'

export const promptVersion = 'v1' as const

const systemPrompt = `You are a subtitle post-processing engine.
Convert Whisper segments into broadcast-grade WebVTT.
Strictly obey numeric/structural constraints from the profile.
If a constraint would be violated, split into multiple cues.
Never exceed max lines, max CPL, max CPS.
Do not paraphrase, invent, or drop information.
Output must be valid WebVTT only.`

const userPrompt = `Reformat provided segments into WebVTT cues.
Apply the profile exactly.
Compute CPS and enforce limits.
Split cues or extend timing only within duration bounds and non-overlap rules.
One thought per cue when possible.
Preserve meaning exactly.
Return ONLY WebVTT.`

export interface AiCallOptions {
  validatorErrors?: string
}

export async function callAiPostProcessor(
  input: SubtitleAIInput,
  options: AiCallOptions = {}
): Promise<string> {
  if (process.env.OPENAI_API_KEY == null) {
    throw new Error('Missing OPENAI_API_KEY for subtitle post-processor')
  }

  const apiUrl = process.env.OPENAI_API_URL ?? DEFAULT_API_URL
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            `${userPrompt}\n\nInput JSON:\n${JSON.stringify(input, null, 2)}` +
            (options.validatorErrors
              ? `\n\nValidation errors:\n${options.validatorErrors}`
              : '')
        }
      ]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI request failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (content == null) {
    throw new Error('AI response missing content')
  }

  return content.trim()
}

export function buildValidatorErrorPrompt(errors: string[]): string {
  return errors.join('\n')
}
