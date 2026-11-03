import { type LanguageModel, Output, streamText } from 'ai'
import { z } from 'zod'

export type GenerateJsonResult<T> =
  | { ok: true; value: T; text: string }
  | { ok: false; error: string; text: string }

interface GenerateJsonOptions<T> {
  model: LanguageModel
  abortSignal: AbortSignal
  instructions: string
  prompt: string
  schema: z.ZodType<T>
  /** Called with each streamed chunk of raw output text. */
  onDelta?: (delta: string) => void
}

/**
 * One streamed model call whose output should be JSON in `schema`'s shape.
 *
 * The schema is sent to the gateway so it can hold the output to that shape
 * when it supports it. The text is still parsed and checked here, and a bad
 * result is returned rather than thrown: the caller decides whether to retry
 * or run a repair round with `error`.
 */
export async function generateJson<T>({
  model,
  abortSignal,
  instructions,
  prompt,
  schema,
  onDelta
}: GenerateJsonOptions<T>): Promise<GenerateJsonResult<T>> {
  // streamText reports a failed request (gateway down, HTTP 500) through
  // onError and just ends the stream. Rethrow it, or an outage would look
  // like an empty, invalid answer and get blamed on the user's message.
  let streamError: unknown
  const result = streamText({
    model,
    abortSignal,
    maxRetries: 0,
    instructions,
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    output: Output.object({ schema }),
    onError: ({ error }) => {
      streamError = error
    }
  })

  let text = ''
  for await (const delta of result.textStream) {
    text += delta
    onDelta?.(delta)
  }
  if (streamError != null)
    throw streamError instanceof Error
      ? streamError
      : new Error('The AI model request failed', { cause: streamError })

  return parseJson(text, schema)
}

export function parseJson<T>(
  text: string,
  schema: z.ZodType<T>
): GenerateJsonResult<T> {
  let raw: unknown
  try {
    raw = JSON.parse(extractJson(text))
  } catch {
    return { ok: false, error: 'The output was not valid JSON.', text }
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success)
    return { ok: false, error: z.prettifyError(parsed.error), text }
  return { ok: true, value: parsed.data, text }
}

/**
 * Strips what a model wraps around JSON when the gateway does not hold it to
 * the schema: a reasoning `<think>` block, and Markdown code fences.
 */
export function extractJson(text: string): string {
  const withoutThinking = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  const fenced = withoutThinking.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced != null) return fenced[1].trim()
  return withoutThinking
}
