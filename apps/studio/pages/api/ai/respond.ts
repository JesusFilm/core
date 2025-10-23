import type { NextApiRequest, NextApiResponse } from 'next'
import { createOpenAI } from '@ai-sdk/openai'
import {
  convertToCoreMessages,
  generateText,
  type CoreMessage,
  type LanguageModelUsage
} from 'ai'

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
const OPENROUTER_APP_TITLE =
  process.env.OPENROUTER_APP_TITLE ?? 'JF Studio'
const DEFAULT_MODEL = 'x-ai/grok-4-fast'

const isString = (value: unknown): value is string => typeof value === 'string'
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object'

const buildOpenRouterHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-Title': OPENROUTER_APP_TITLE
  }

  if (isString(process.env.OPENROUTER_HTTP_REFERER)) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER
  }

  return headers
}

const createOpenRouterClient = (apiKey: string) =>
  createOpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    compatibility: 'compatible',
    name: 'openrouter',
    headers: buildOpenRouterHeaders()
  })

const ensureMessages = (rawMessages: unknown): CoreMessage[] => {
  if (!Array.isArray(rawMessages)) {
    throw new Error('Messages payload must be an array.')
  }

  try {
    return convertToCoreMessages(rawMessages as Array<any>)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to normalize messages.'
    throw new Error(message)
  }
}

const buildProviderOptions = (
  body: Record<string, unknown>
): Record<string, unknown> => {
  const providerOptions: Record<string, unknown> = {}

  if (isBoolean(body.store)) providerOptions.store = body.store
  if (isBoolean(body.parallel_tool_calls)) {
    providerOptions.parallelToolCalls = body.parallel_tool_calls
  }
  if (isString(body.previous_response_id)) {
    providerOptions.previousResponseId = body.previous_response_id
  }
  if (isString(body.instructions)) {
    providerOptions.instructions = body.instructions
  }
  if (body.metadata !== undefined) {
    providerOptions.metadata = body.metadata
  }
  if (isString(body.user)) providerOptions.user = body.user

  const reasoning = body.reasoning
  if (isRecord(reasoning) && isString(reasoning.effort)) {
    providerOptions.reasoningEffort = reasoning.effort
  }

  return providerOptions
}

const mapUsage = (usage: LanguageModelUsage | undefined) => ({
  input_tokens: usage?.promptTokens ?? 0,
  output_tokens: usage?.completionTokens ?? 0,
  total_tokens:
    usage?.totalTokens ??
    (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0)
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[AI Respond] Received ${req.method} request`)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!isString(apiKey) || apiKey.trim() === '') {
    res
      .status(500)
      .json({ error: 'OPENROUTER_API_KEY is not configured on the server.' })
    return
  }

  const body = isRecord(req.body) ? (req.body as Record<string, unknown>) : {}

  const model = isString(body.model) && body.model.trim() !== ''
    ? body.model.trim()
    : DEFAULT_MODEL

  const maxOutputTokens = isNumber(body.max_output_tokens)
    ? body.max_output_tokens
    : isNumber(body.max_tokens)
      ? body.max_tokens
      : undefined

  const providerOptions = buildProviderOptions(body)

  let prompt: string | undefined
  let messages: CoreMessage[] | undefined

  if (Array.isArray(body.messages)) {
    try {
      messages = ensureMessages(body.messages)
    } catch (error) {
      res.status(400).json({
        error: 'Invalid messages payload.',
        details: error instanceof Error ? error.message : undefined
      })
      return
    }

    if (messages.length === 0) {
      res.status(400).json({ error: 'Provided messages array is empty.' })
      return
    }
  } else if (isString(body.input) && body.input.trim() !== '') {
    prompt = body.input.trim()
  } else {
    res
      .status(400)
      .json({ error: 'Request body must include messages or input.' })
    return
  }

  const client = createOpenRouterClient(apiKey)

  try {
    const generationOptions: Parameters<typeof generateText>[0] = {
      model: client.responses(model as any),
      temperature: isNumber(body.temperature) ? body.temperature : undefined,
      topP: isNumber(body.top_p) ? body.top_p : undefined,
      maxTokens: maxOutputTokens
    }

    if (messages != null) generationOptions.messages = messages
    if (prompt != null) generationOptions.prompt = prompt
    if (Object.keys(providerOptions).length > 0) {
      generationOptions.providerOptions = providerOptions as any
    }

    console.log(`[AI Respond] Sending request to OpenRouter - Model: ${model}, Messages: ${messages?.length ?? 0}, Prompt: ${prompt ? 'yes' : 'no'}`)

    const result = await generateText(generationOptions)

    const responseId = result.response?.id ?? `or-${Date.now()}`
    const createdAt = result.response?.timestamp ?? new Date()
    const text = result.text ?? ''

    console.log(`[AI Respond] Received response from OpenRouter - Response ID: ${responseId}, Finish Reason: ${result.finishReason}, Usage: ${JSON.stringify(mapUsage(result.usage))}`)

    res.status(200).json({
      id: responseId,
      model,
      created: Math.floor(createdAt.getTime() / 1000),
      provider: 'openrouter',
      finish_reason: result.finishReason,
      warnings: result.warnings ?? [],
      usage: mapUsage(result.usage),
      output_text: text,
      output: [
        {
          id: `${responseId}-msg-0`,
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text
            }
          ]
        }
      ]
    })
  } catch (error) {
    console.error('OpenRouter proxy error:', error)

    if (isRecord(error) && typeof error.status === 'number') {
      res.status(error.status).json({
        error: 'OpenRouter request failed',
        details: isString(error.message) ? error.message : undefined
      })
      return
    }

    res.status(500).json({
      error: 'Unexpected error while contacting OpenRouter.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
