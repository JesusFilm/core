import { createOpenAI } from '@ai-sdk/openai'
import {
  type CoreMessage,
  type LanguageModelUsage,
  convertToCoreMessages,
  generateText
} from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE ?? 'JF Studio'
const DEFAULT_MODEL = 'x-ai/grok-4-fast'

const APOLOGIST_AGENT_DOMAIN = process.env.APOLOGIST_AGENT_DOMAIN
const APOLOGIST_API_KEY = process.env.APOLOGIST_API_KEY
const APOLOGIST_DEFAULT_MODEL =
  process.env.APOLOGIST_DEFAULT_MODEL ?? 'openai/gpt/4o'

const isString = (value: unknown): value is string => typeof value === 'string'
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean'
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
    return convertToCoreMessages(rawMessages)
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

const buildApologistHeaders = (
  apiKey: string,
  cacheTtl?: number
): Record<string, string> => {
  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  }

  if (isNumber(cacheTtl) && cacheTtl > 0) {
    headers['x-cache-ttl'] = cacheTtl.toString()
  }

  return headers
}

const buildApologistRequestBody = (
  body: Record<string, unknown>,
  messages?: CoreMessage[],
  prompt?: string
): Record<string, unknown> => {
  const requestBody: Record<string, unknown> = {
    stream: false // Non-streaming by default per requirements
  }

  // Model selection
  if (isString(body.model) && body.model.trim() !== '') {
    requestBody.model = body.model.trim()
  } else {
    requestBody.model = APOLOGIST_DEFAULT_MODEL
  }

  // Messages or prompt
  if (messages != null && messages.length > 0) {
    requestBody.messages = messages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === 'string'
          ? msg.content
          : msg.content.map((c) => (c.type === 'text' ? c.text : '')).join('')
    }))
  } else if (prompt != null) {
    requestBody.prompt = prompt
  }

  // Pass-through parameters
  if (isNumber(body.temperature)) requestBody.temperature = body.temperature
  if (isNumber(body.top_p)) requestBody.top_p = body.top_p

  // Max tokens
  const maxTokens = isNumber(body.max_output_tokens)
    ? body.max_output_tokens
    : isNumber(body.max_tokens)
      ? body.max_tokens
      : undefined
  if (maxTokens != null) requestBody.max_completion_tokens = maxTokens

  // Optional fields
  if (body.response_format != null)
    requestBody.response_format = body.response_format
  if (body.metadata != null) requestBody.metadata = body.metadata

  return requestBody
}

const normalizeApologistResponse = (responseData: any, model: string) => {
  const id = responseData.id ?? `ap-${Date.now()}`
  const created = responseData.created ?? Math.floor(Date.now() / 1000)
  const finishReason = responseData.choices?.[0]?.finish_reason ?? 'stop'

  // Extract text content
  let text = ''
  if (responseData.choices?.[0]?.message?.content) {
    text = responseData.choices[0].message.content
  } else if (responseData.content) {
    text = responseData.content
  } else if (responseData.text) {
    text = responseData.text
  }

  // Map usage
  const usage = responseData.usage ?? {}
  const mappedUsage = {
    input_tokens: usage.prompt_tokens ?? 0,
    output_tokens: usage.completion_tokens ?? 0,
    total_tokens:
      usage.total_tokens ??
      (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0)
  }

  return {
    id,
    model,
    created,
    provider: 'apologist',
    finish_reason: finishReason,
    warnings: responseData.warnings ?? [],
    usage: mappedUsage,
    output_text: text,
    output: [
      {
        id: `${id}-msg-0`,
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
  }
}

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

  const body = isRecord(req.body) ? req.body : {}

  const provider =
    isString(body.provider) &&
    (body.provider === 'openrouter' || body.provider === 'apologist')
      ? body.provider
      : 'openrouter'

  const model =
    isString(body.model) && body.model.trim() !== ''
      ? body.model.trim()
      : provider === 'apologist'
        ? APOLOGIST_DEFAULT_MODEL
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

  // Handle Apologist provider
  if (provider === 'apologist') {
    if (
      !isString(APOLOGIST_AGENT_DOMAIN) ||
      APOLOGIST_AGENT_DOMAIN.trim() === ''
    ) {
      res
        .status(500)
        .json({
          error: 'APOLOGIST_AGENT_DOMAIN is not configured on the server.'
        })
      return
    }

    if (!isString(APOLOGIST_API_KEY) || APOLOGIST_API_KEY.trim() === '') {
      res
        .status(500)
        .json({ error: 'APOLOGIST_API_KEY is not configured on the server.' })
      return
    }

    try {
      const cacheTtl = isNumber(body.cache_ttl)
        ? body.cache_ttl
        : isNumber(req.query.cache_ttl)
          ? Number(req.query.cache_ttl)
          : isString(req.headers['x-cache-ttl'])
            ? Number(req.headers['x-cache-ttl'])
            : undefined

      const headers = buildApologistHeaders(APOLOGIST_API_KEY, cacheTtl)
      const requestBody = buildApologistRequestBody(body, messages, prompt)

      console.log(
        `[AI Respond] Sending request to Apologist - Model: ${model}, Messages: ${messages?.length ?? 0}, Prompt: ${prompt ? 'yes' : 'no'}`
      )

      const response = await fetch(
        `https://${APOLOGIST_AGENT_DOMAIN}/api/v1/chat/completions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        res.status(response.status).json({
          error: 'Apologist request failed',
          details: errorData || 'Unknown error'
        })
        return
      }

      const responseData = await response.json()
      const normalizedResponse = normalizeApologistResponse(responseData, model)

      console.log(
        `[AI Respond] Received response from Apologist - Response ID: ${normalizedResponse.id}, Finish Reason: ${normalizedResponse.finish_reason}, Usage: ${JSON.stringify(normalizedResponse.usage)}`
      )

      res.status(200).json(normalizedResponse)
    } catch (error) {
      console.error('Apologist proxy error:', error)

      if (isRecord(error) && typeof error.status === 'number') {
        res.status(error.status).json({
          error: 'Apologist request failed',
          details: isString(error.message) ? error.message : undefined
        })
        return
      }

      res.status(500).json({
        error: 'Unexpected error while contacting Apologist.',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    return
  }

  // Handle OpenRouter provider (existing logic)
  const client = createOpenRouterClient(apiKey)

  try {
    const generationOptions: Parameters<typeof generateText>[0] = {
      model: client.responses(model),
      temperature: isNumber(body.temperature) ? body.temperature : undefined,
      topP: isNumber(body.top_p) ? body.top_p : undefined,
      maxTokens: maxOutputTokens
    }

    if (messages != null) generationOptions.messages = messages
    if (prompt != null) generationOptions.prompt = prompt
    if (Object.keys(providerOptions).length > 0) {
      generationOptions.providerOptions = providerOptions as any
    }

    console.log(
      `[AI Respond] Sending request to OpenRouter - Model: ${model}, Messages: ${messages?.length ?? 0}, Prompt: ${prompt ? 'yes' : 'no'}`
    )

    const result = await generateText(generationOptions)

    const responseId = result.response?.id ?? `or-${Date.now()}`
    const createdAt = result.response?.timestamp ?? new Date()
    const text = result.text ?? ''

    console.log(
      `[AI Respond] Received response from OpenRouter - Response ID: ${responseId}, Finish Reason: ${result.finishReason}, Usage: ${JSON.stringify(mapUsage(result.usage))}`
    )

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
