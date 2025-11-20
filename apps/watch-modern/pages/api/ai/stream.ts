import { createOpenAI } from '@ai-sdk/openai'
import {
  type CoreMessage,
  type LanguageModelUsage,
  streamObject
} from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { z } from 'zod'

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
const OPENROUTER_APP_TITLE =
  process.env.OPENROUTER_APP_TITLE ?? 'JF Studio'
const DEFAULT_MODEL = 'x-ai/grok-4-fast'

const APOLOGIST_AGENT_DOMAIN = process.env.APOLOGIST_AGENT_DOMAIN
const APOLOGIST_API_KEY = process.env.APOLOGIST_API_KEY
const APOLOGIST_DEFAULT_MODEL = process.env.APOLOGIST_DEFAULT_MODEL ?? 'openai/gpt-4o'

const isString = (value: unknown): value is string => typeof value === 'string'
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object'

interface StructuredError {
  message: string
  code?: string
  provider?: string
  isRetryable?: boolean
  actionUrl?: string
  hint?: string
}

export const toStructuredError = (error: unknown, provider: 'openrouter' | 'apologist' = 'openrouter'): StructuredError => {
  // Default error structure
  const structured: StructuredError = {
    message: 'AI streaming failed',
    provider,
    isRetryable: false
  }

  if (!error || typeof error !== 'object') {
    return structured
  }

  const err = error as any

  // Extract message if available
  if (err.message && typeof err.message === 'string') {
    structured.message = err.message
  }

  // Map specific error codes and messages
  if (err.statusCode === 402 || err.message?.includes('Insufficient credits')) {
    structured.code = 'INSUFFICIENT_CREDITS'
    structured.actionUrl = 'https://openrouter.ai/settings/credits'
    structured.isRetryable = false
  } else if (err.statusCode === 429 || err.message?.includes('rate') || err.message?.includes('Rate limit')) {
    structured.code = 'RATE_LIMIT'
    structured.isRetryable = true
  } else if (err.statusCode === 404 || err.message?.includes('model not found') || err.message?.includes('model not available') || err.message?.includes('Model not found')) {
    structured.code = 'MODEL_UNAVAILABLE'
    structured.isRetryable = true
  } else if (err.message?.includes('timeout') || err.message?.includes('Timeout') || err.name === 'AbortError') {
    structured.code = 'NETWORK_TIMEOUT'
    structured.isRetryable = true
  } else if (err.message?.includes('network') || err.message?.includes('Network') || err.message?.includes('ECONNREFUSED') || err.message?.includes('ENOTFOUND')) {
    structured.code = 'NETWORK'
    structured.isRetryable = true
  } else if (err.message?.includes('API key') || err.message?.includes('authentication') || err.message?.includes('unauthorized')) {
    structured.code = 'AUTHENTICATION'
    structured.isRetryable = false
  }

  return structured
}

// In-memory session storage (consider Redis for multi-instance deployments)
interface StreamSession {
  id: string
  provider: 'openrouter' | 'apologist'
  model: string
  messages?: CoreMessage[]
  prompt?: string
  options: Record<string, unknown>
  mode: 'default' | 'conversation'
  createdAt: Date
}

const globalSessions = globalThis as typeof globalThis & {
  __WATCH_MODERN_AI_STREAM_SESSIONS__?: Map<string, StreamSession>
}

const sessions =
  globalSessions.__WATCH_MODERN_AI_STREAM_SESSIONS__ ??
  (globalSessions.__WATCH_MODERN_AI_STREAM_SESSIONS__ = new Map<string, StreamSession>())

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
    // Validate and cast messages to CoreMessage format
    // AI SDK expects messages with role and content properties
    return rawMessages.map((msg: any) => {
      if (!msg.role || !msg.content) {
        throw new Error(`Message missing required fields: ${JSON.stringify(msg)}`)
      }
      if (typeof msg.content !== 'string') {
        throw new Error(`Message content must be a string: ${JSON.stringify(msg)}`)
      }
      return msg as CoreMessage
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to normalize messages.'
    throw new Error(`${message} - Raw input: ${JSON.stringify(rawMessages)}`)
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
  if (body.metadata !== undefined) providerOptions.metadata = body.metadata
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

const MAX_CONVERSATION_STEPS = 5

const defaultStepSchema = z
  .object({
    title: z.string().optional(),
    content: z.string().optional(),
    keywords: z.union([z.string(), z.array(z.string())]).optional(),
    mediaPrompt: z.string().optional()
  })
  .catchall(z.unknown())

const defaultStepsSchema = z
  .object({
    steps: z.array(defaultStepSchema).optional()
  })
  .catchall(z.unknown())

const conversationMapSchema = z.object({
  conversationMap: z.object({
    flow: z
      .object({
        sequence: z.array(z.string()).max(MAX_CONVERSATION_STEPS),
        rationale: z.string().nullable()
      })
      .nullable()
      .optional(),
    steps: z
      .array(
        z
          .object({
            title: z.string().optional(),
            purpose: z.string().nullable().optional(),
            guideMessage: z.string().optional(),
            scriptureOptions: z
              .array(
                z
                  .object({
                    text: z.string().nullable().optional(),
                    reference: z.string().nullable().optional(),
                    whyItFits: z.string().nullable().optional(),
                    conversationExamples: z
                      .array(
                        z
                          .object({
                            tone: z.string().optional(),
                            message: z.string().optional()
                          })
                          .partial()
                      )
                      .optional()
                  })
                  .partial()
              )
              .max(10)
              .optional()
          })
          .partial()
      )
      .max(MAX_CONVERSATION_STEPS)
      .optional()
  })
})

type ConversationSchemaObject = z.infer<typeof conversationMapSchema>
type DefaultStepsSchema = z.infer<typeof defaultStepsSchema>

const mergeDeep = (target: unknown, source: unknown): unknown => {
  if (source === undefined) {
    return target
  }

  if (Array.isArray(source)) {
    const base = Array.isArray(target) ? target.slice() : []
    source.forEach((value, index) => {
      base[index] = mergeDeep(base[index], value)
    })
    return base
  }

  if (source !== null && typeof source === 'object') {
    const targetRecord =
      target !== null && typeof target === 'object' && !Array.isArray(target)
        ? (target as Record<string, unknown>)
        : {}

    const result: Record<string, unknown> = { ...targetRecord }

    for (const [key, value] of Object.entries(
      source as Record<string, unknown>
    )) {
      result[key] = mergeDeep(targetRecord[key], value)
    }

    return result
  }

  return source
}

const buildApologistHeaders = (apiKey: string, cacheTtl?: number): Record<string, string> => {
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
    stream: true // Enable streaming for Apologist
  }

  // Model selection
  if (isString(body.model) && body.model.trim() !== '') {
    requestBody.model = body.model.trim()
  } else {
    requestBody.model = APOLOGIST_DEFAULT_MODEL
  }

  // Messages or prompt
  if (messages != null && messages.length > 0) {
    requestBody.messages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : msg.content.map(c => c.type === 'text' ? c.text : '').join('')
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
  if (body.response_format != null) requestBody.response_format = body.response_format
  if (body.metadata != null) requestBody.metadata = body.metadata

  return requestBody
}

const sendSSEEvent = (res: NextApiResponse, event: string, data: unknown) => {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

const sendSSEComment = (res: NextApiResponse, comment: string) => {
  res.write(`: ${comment}\n\n`)
}

// Handle POST: Create streaming session
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!isString(apiKey) || apiKey.trim() === '') {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server.' })
  }

  const body = isRecord(req.body) ? req.body : {}

  const provider = isString(body.provider) && (body.provider === 'openrouter' || body.provider === 'apologist')
    ? body.provider
    : 'openrouter'

  const mode =
    isString(body.mode) && body.mode === 'conversation'
      ? 'conversation'
      : 'default'

  const model = isString(body.model) && body.model.trim() !== ''
    ? body.model.trim()
    : provider === 'apologist' ? APOLOGIST_DEFAULT_MODEL : DEFAULT_MODEL

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
      return res.status(400).json({
        error: 'Invalid messages payload.',
        details: error instanceof Error ? error.message : undefined
      })
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: 'Provided messages array is empty.' })
    }
  } else if (isString(body.input) && body.input.trim() !== '') {
    prompt = body.input.trim()
  } else {
    return res.status(400).json({ error: 'Request body must include messages or input.' })
  }

  // Validate provider-specific requirements
  if (provider === 'apologist') {
    if (!isString(APOLOGIST_AGENT_DOMAIN) || APOLOGIST_AGENT_DOMAIN.trim() === '') {
      return res.status(500).json({ error: 'APOLOGIST_AGENT_DOMAIN is not configured on the server.' })
    }

    if (!isString(APOLOGIST_API_KEY) || APOLOGIST_API_KEY.trim() === '') {
      return res.status(500).json({ error: 'APOLOGIST_API_KEY is not configured on the server.' })
    }
  }

  // Create session
  const sessionId = randomUUID()
  const session: StreamSession = {
    id: sessionId,
    provider,
    model,
    messages,
    prompt,
    mode,
    options: {
      ...providerOptions,
      maxTokens: maxOutputTokens,
      temperature: isNumber(body.temperature) ? body.temperature : undefined,
      topP: isNumber(body.top_p) ? body.top_p : undefined
    },
    createdAt: new Date()
  }

  sessions.set(sessionId, session)

  console.log(`[AI Stream] Created session ${sessionId} for ${provider} with ${messages?.length ?? 0} messages`)

  return res.status(201).json({ id: sessionId })
}

// Handle GET: Start SSE stream
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query

  if (!isString(id)) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  const session = sessions.get(id)
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' })
  }

  // Remove session from memory once streaming starts
  sessions.delete(id)

  console.log(`[AI Stream] Starting ${session.provider} stream for session ${id}`)

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control')

  // Send initial event
  sendSSEEvent(res, 'open', { id })

  let isStreamEnded = false

  const endStream = () => {
    if (isStreamEnded) return
    isStreamEnded = true
    clearInterval(heartbeatInterval)
    sendSSEEvent(res, 'done', {})
    res.end()
  }

  // Heartbeat every 15 seconds
  const heartbeatInterval = setInterval(() => {
    if (!isStreamEnded) {
      sendSSEComment(res, 'keep-alive')
    }
  }, 15000)

  // Handle client disconnect
  req.on('close', () => {
    console.log(`[AI Stream] Client disconnected for session ${id}`)
    endStream()
  })

  try {
    if (session.provider === 'openrouter') {
      if (session.mode === 'conversation') {
        await handleOpenRouterConversationStream(session, res, endStream)
      } else {
        await handleOpenRouterStream(session, res, endStream)
      }
    } else {
      await handleApologistStream(session, res, endStream)
    }
  } catch (error) {
    console.error(`[AI Stream] Error in ${session.provider} stream:`, error)
    if (!isStreamEnded) {
      const structuredError = toStructuredError(error, session.provider)
      sendSSEEvent(res, 'error', structuredError)
      endStream()
    }
  }
}

const handleOpenRouterStream = async (
  session: StreamSession,
  res: NextApiResponse,
  endStream: () => void
) => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!isString(apiKey) || apiKey.trim() === '') {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const client = createOpenRouterClient(apiKey)

  const generationOptions: Parameters<typeof streamObject>[0] = {
    model: client.responses(session.model),
    schema: defaultStepsSchema
  }

  if (session.messages != null) generationOptions.messages = session.messages
  if (session.prompt != null) generationOptions.prompt = session.prompt
  if (session.options.temperature != null) generationOptions.temperature = session.options.temperature as number
  if (session.options.topP != null) generationOptions.topP = session.options.topP as number
  if (session.options.maxTokens != null) generationOptions.maxTokens = session.options.maxTokens as number

  const result = await streamObject<DefaultStepsSchema>(generationOptions)

  let mergedPartial: DefaultStepsSchema | null = null
  let accumulatedText = ''
  let usageSent = false

  // Set a timeout for the streaming operation
  const streamTimeout = setTimeout(() => {
    console.error(`[AI Stream] Stream timeout - no response after 30 seconds`)
    const timeoutError = toStructuredError({ message: 'Request timed out', name: 'AbortError' }, 'openrouter')
    sendSSEEvent(res, 'error', timeoutError)
    endStream()
  }, 30000)

  let partCount = 0
  try {
    for await (const part of result.fullStream) {
      partCount++
      if (part.type === 'text-delta') {
        if (part.textDelta) {
          accumulatedText += part.textDelta
          sendSSEEvent(res, 'delta', { text: part.textDelta })
        }
      } else if (part.type === 'object' && part.object) {
        mergedPartial = mergeDeep(mergedPartial, part.object) as DefaultStepsSchema | null
        const stepsPayload =
          mergedPartial != null && typeof mergedPartial === 'object'
            ? (mergedPartial as DefaultStepsSchema).steps
            : undefined
        if (stepsPayload && Array.isArray(stepsPayload)) {
          sendSSEEvent(res, 'steps', { steps: stepsPayload })
        }
      } else if (part.type === 'error') {
        console.log(`[AI Stream] Error part:`, part.error)

        // Convert to structured error
        const structuredError = toStructuredError(part.error, 'openrouter')
        sendSSEEvent(res, 'error', structuredError)
        // Continue processing to let the stream end gracefully
      } else if (part.type === 'finish') {
        if (part.usage && !usageSent) {
          sendSSEEvent(res, 'usage', mapUsage(part.usage))
          usageSent = true
        }
      }
    }
    clearTimeout(streamTimeout)
  } catch (streamError) {
    clearTimeout(streamTimeout)
    console.error(`[AI Stream] Error during streaming:`, streamError)
    const structuredError = toStructuredError(streamError, 'openrouter')
    sendSSEEvent(res, 'error', structuredError)
    endStream()
    return
  }

  if (partCount === 0) {
    console.error(`[AI Stream] ERROR: No parts received from stream! This indicates the AI model is not responding.`)
    const noPartsError = toStructuredError({ message: 'AI streaming failed: No content received from AI model' }, 'openrouter')
    sendSSEEvent(res, 'error', noPartsError)
    endStream()
    return
  }

  const usage = await result.usage
  if (usage && !usageSent) {
    sendSSEEvent(res, 'usage', mapUsage(usage))
    usageSent = true
  }

  const finalObject =
    mergedPartial ?? ((await result.object) as DefaultStepsSchema | null)

  if (finalObject?.steps && Array.isArray(finalObject.steps)) {
    sendSSEEvent(res, 'steps', { steps: finalObject.steps })
  }

  let messagePayload = accumulatedText

  if (!messagePayload && finalObject) {
    messagePayload = JSON.stringify(finalObject, null, 2)
  } else if (messagePayload) {
    try {
      const parsed = JSON.parse(messagePayload)
      messagePayload = JSON.stringify(parsed, null, 2)
    } catch {
      // Leave as-is if parsing fails
    }
  }

  sendSSEEvent(res, 'message', {
    id: `or-default-${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [{
      type: 'output_text',
      text: messagePayload
    }]
  })

  endStream()
}

const handleOpenRouterConversationStream = async (
  session: StreamSession,
  res: NextApiResponse,
  endStream: () => void
) => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!isString(apiKey) || apiKey.trim() === '') {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const client = createOpenRouterClient(apiKey)

  const generationOptions: Parameters<typeof streamObject>[0] = {
    model: client.responses(session.model),
    schema: conversationMapSchema
  }

  if (session.messages != null) generationOptions.messages = session.messages
  if (session.prompt != null) generationOptions.prompt = session.prompt
  if (session.options.temperature != null) generationOptions.temperature = session.options.temperature as number
  if (session.options.topP != null) generationOptions.topP = session.options.topP as number
  if (session.options.maxTokens != null) generationOptions.maxTokens = session.options.maxTokens as number

  const result = await streamObject<ConversationSchemaObject>(generationOptions)

  let mergedPartial: ConversationSchemaObject | null = null
  let accumulatedText = ''

  let usageSent = false

  // Set a timeout for the streaming operation
  const streamTimeout = setTimeout(() => {
    console.error(`[AI Stream] CONVERSATION MODE: Stream timeout - no response after 30 seconds`)
    const timeoutError = toStructuredError({ message: 'Request timed out', name: 'AbortError' }, 'openrouter')
    sendSSEEvent(res, 'error', timeoutError)
    endStream()
  }, 30000)

  let partCount = 0
  try {
    for await (const part of result.fullStream) {
      partCount++
      if (part.type === 'text-delta') {
        if (part.textDelta) {
          accumulatedText += part.textDelta
          sendSSEEvent(res, 'delta', { text: part.textDelta })
        }
      } else if (part.type === 'object' && part.object) {
        mergedPartial = mergeDeep(mergedPartial, part.object) as ConversationSchemaObject | null
        const conversationPayload = mergedPartial?.conversationMap
        if (conversationPayload) {
          sendSSEEvent(res, 'conversation', conversationPayload)
        }
      } else if (part.type === 'error') {
        console.log(`[AI Stream] CONVERSATION MODE: Error part:`, part.error)

        // Convert to structured error
        const structuredError = toStructuredError(part.error, 'openrouter')
        sendSSEEvent(res, 'error', structuredError)
        // Continue processing to let the stream end gracefully
      } else if (part.type === 'finish') {
        // Usage is handled after the loop
        if (part.usage && !usageSent) {
          sendSSEEvent(res, 'usage', mapUsage(part.usage))
          usageSent = true
        }
      }
    }
    clearTimeout(streamTimeout)
  } catch (streamError) {
    clearTimeout(streamTimeout)
    console.error(`[AI Stream] CONVERSATION MODE: Error during streaming:`, streamError)
    const structuredError = toStructuredError(streamError, 'openrouter')
    sendSSEEvent(res, 'error', structuredError)
    endStream()
    return
  }

  if (partCount === 0) {
    console.error(`[AI Stream] CONVERSATION MODE: ERROR: No parts received from stream! This indicates the AI model is not responding.`)
    const noPartsError = toStructuredError({ message: 'AI streaming failed: No content received from AI model' }, 'openrouter')
    sendSSEEvent(res, 'error', noPartsError)
    endStream()
    return
  }

  const usage = await result.usage
  if (usage && !usageSent) {
    sendSSEEvent(res, 'usage', mapUsage(usage))
    usageSent = true
  }

  const finalObject =
    mergedPartial ?? ((await result.object) as ConversationSchemaObject | null)

  if (finalObject?.conversationMap) {
    sendSSEEvent(res, 'conversation', finalObject.conversationMap)
  }

  let messagePayload = accumulatedText

  if (!messagePayload) {
    messagePayload = JSON.stringify(finalObject ?? {}, null, 2)
  } else {
    try {
      const parsed = JSON.parse(messagePayload)
      messagePayload = JSON.stringify(parsed, null, 2)
    } catch {
      // Leave as-is if parsing fails
    }
  }

  sendSSEEvent(res, 'message', {
    id: `or-conv-${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        text: messagePayload
      }
    ]
  })

  endStream()
}

const handleApologistStream = async (
  session: StreamSession,
  res: NextApiResponse,
  endStream: () => void
) => {
  if (!isString(APOLOGIST_AGENT_DOMAIN) || !isString(APOLOGIST_API_KEY)) {
    throw new Error('Apologist configuration missing')
  }

  const cacheTtl = isNumber(session.options.cache_ttl)
    ? session.options.cache_ttl
    : undefined

  const headers = buildApologistHeaders(APOLOGIST_API_KEY, cacheTtl)
  const requestBody = buildApologistRequestBody(session.options, session.messages, session.prompt)

  console.log(`[AI Stream] Sending streaming request to Apologist - Model: ${session.model}`)

  const response = await fetch(`https://${APOLOGIST_AGENT_DOMAIN}/api/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Apologist request failed: ${errorData}`)
  }

  // Check if Apologist supports streaming
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('text/event-stream')) {
    // Handle streaming response
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body reader')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.choices?.[0]?.delta?.content) {
              const text = data.choices[0].delta.content
              sendSSEEvent(res, 'delta', { text })
            }
            // TODO: Handle usage when available in streaming response
          } catch {
            // Ignore parsing errors for non-JSON lines
          }
        }
      }
    }
  } else {
    // Fallback to non-streaming: get full response and send as single delta
    const responseData = await response.json()
    const text = responseData.choices?.[0]?.message?.content || responseData.content || ''

    sendSSEEvent(res, 'delta', { text })

    const usage = responseData.usage ?? {}
    sendSSEEvent(res, 'usage', {
      input_tokens: usage.prompt_tokens ?? 0,
      output_tokens: usage.completion_tokens ?? 0,
      total_tokens: usage.total_tokens ?? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0)
    })

    sendSSEEvent(res, 'message', {
      id: `ap-${Date.now()}`,
      type: 'message',
      role: 'assistant',
      content: [{
        type: 'output_text',
        text
      }]
    })
  }

  endStream()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[AI Stream] Received ${req.method} request`)

  if (req.method === 'POST') {
    return handlePost(req, res)
  } else if (req.method === 'GET') {
    return handleGet(req, res)
  } else {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
}
