import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  type LanguageModel,
  UIMessage,
  convertToModelMessages,
  streamText
} from 'ai'
import { Langfuse, TextPromptClient } from 'langfuse'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { getFlags } from '../../../src/libs/getFlags'
import {
  APOLOGIST_PROMPT_NAME,
  getActivePromptLabel,
  getLangfuse
} from '../../../src/libs/langfuse/client'
import { logger } from '../../../src/libs/logger'

// Request bounds (NES-1579). Hard ceilings so a single chat request can't be
// arbitrarily expensive or arbitrarily shaped.
const MAX_MESSAGES = 20
const MAX_PARTS_PER_MESSAGE = 20
// Applied per field — once on `content` and once on each `parts[].text` —
// so a single message can carry more than this in aggregate. The
// MAX_TOTAL_CHARS budget below is the real per-request backstop.
// Keep in sync with the per-message cap MAX_MESSAGE_CHARS in
// libs/journeys/ui/src/components/PromptInput/PromptInput.tsx — the UI
// caps typing/pasting at that length and the server rejects any single
// field longer than it, so the two constants must match.
const MAX_FIELD_CHARS = 4000
// ~5000 input-token budget at ~4 chars/token. Buys ~8-10 turns of normal
// conversation before the cap bites. Conversation-history management
// (sliding window / rolling summary) is the proper fix and is tracked
// separately under Cleanup & Tech Debt.
const MAX_TOTAL_CHARS = 20000
const MAX_OUTPUT_TOKENS = 512

export const config = {
  api: {
    // Sized for the MAX_TOTAL_CHARS budget with 4-byte-per-char UTF-8 worst
    // case (international users) + JSON wrapping. Oversized bodies are
    // rejected by Next.js with 413 before the handler runs.
    bodyParser: { sizeLimit: '128kb' }
  }
}

const messagePartSchema = z
  .object({
    type: z.string().min(1).optional(),
    text: z.string().max(MAX_FIELD_CHARS).optional()
  })
  .passthrough()

const messageSchema = z
  .object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(MAX_FIELD_CHARS).optional(),
    parts: z.array(messagePartSchema).max(MAX_PARTS_PER_MESSAGE).optional()
  })
  .passthrough()
  .refine((m) => m.content != null || (m.parts?.length ?? 0) > 0, {
    message: 'message requires content or parts'
  })

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
  language: z.string().max(64).optional(),
  sessionId: z.string().max(128).optional(),
  journeyId: z.string().max(128).optional(),
  journeyTitle: z.string().max(256).optional()
})

type ParsedChatMessage = z.infer<typeof messageSchema>

function totalMessageChars(messages: ParsedChatMessage[]): number {
  let total = 0
  for (const m of messages) {
    if (typeof m.content === 'string') total += m.content.length
    if (Array.isArray(m.parts)) {
      for (const p of m.parts) {
        if (typeof p.text === 'string') total += p.text.length
      }
    }
  }
  return total
}

type ChatProvider = 'apologist' | 'gemini' | 'openai' | 'openrouter'

interface ResolvedChatModel {
  model: LanguageModel
  provider: ChatProvider
  modelId: string
}

function resolveChatModel():
  | { ok: true; resolved: ResolvedChatModel }
  | { ok: false; error: string } {
  const provider = (process.env.CHAT_PROVIDER ?? 'apologist') as ChatProvider

  if (provider === 'gemini') {
    return {
      ok: true,
      resolved: {
        model: google('gemini-2.0-flash'),
        provider,
        modelId: 'gemini-2.0-flash'
      }
    }
  }

  if (provider === 'openai') {
    return {
      ok: true,
      resolved: { model: openai('gpt-4o'), provider, modelId: 'gpt-4o' }
    }
  }

  if (provider === 'openrouter') {
    const apiKey = process.env.OPENROUTER_API_KEY ?? ''
    if (apiKey === '') {
      return { ok: false, error: 'openrouter provider is not configured' }
    }
    const openrouter = createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey
    })
    const modelId =
      process.env.OPENROUTER_MODEL ?? 'google/gemini-3-flash-preview'
    return {
      ok: true,
      resolved: { model: openrouter.chatModel(modelId), provider, modelId }
    }
  }

  const baseURL = process.env.APOLOGIST_API_URL ?? ''
  const apiKey = process.env.APOLOGIST_API_KEY ?? ''
  if (baseURL === '' || apiKey === '') {
    return {
      ok: false,
      error: 'apologist provider is not configured'
    }
  }

  const apologist = createOpenAICompatible({
    name: 'apologist',
    baseURL,
    apiKey
  })
  // Gateway-specific id format with `/` separators (see
  // scripts/apologist-stream-test.sh). Overridable via env for rotation
  // without redeploy.
  const modelId = process.env.APOLOGIST_MODEL_ID ?? 'openai/gpt/4o-mini'
  return {
    ok: true,
    resolved: {
      model: apologist.chatModel(modelId),
      provider: 'apologist',
      modelId
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const startedAt = Date.now()
  const flags = await getFlags()
  if (flags.apologistChat !== true) {
    res.status(404).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const parsed = chatRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid request' })
    return
  }
  const { messages, language, sessionId, journeyId, journeyTitle } =
    parsed.data

  if (totalMessageChars(messages) > MAX_TOTAL_CHARS) {
    res.status(400).json({ error: 'request too large' })
    return
  }

  const modelResult = resolveChatModel()
  if (!modelResult.ok) {
    res.status(503).json({ error: modelResult.error })
    return
  }

  const langfuse = getLangfuse()
  const { system, promptClient } = await resolveSystemMessage({
    language,
    langfuse
  })
  // Defence-in-depth: the schema rejects most malformed inputs, but the
  // AI SDK can still throw on shapes that pass `.passthrough()` (e.g.
  // unsupported part `type`). Map that to a 400 so a malformed-request
  // failure isn't misattributed as an upstream LLM 500. Runs before the
  // trace/generation are created, so there's no dangling Langfuse span.
  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>
  try {
    modelMessages = await convertToModelMessages(
      messages as unknown as UIMessage[]
    )
  } catch (error) {
    const err = error as Error
    logger.error(
      { name: err?.name, message: err?.message },
      '[chat] convertToModelMessages failed'
    )
    res.status(400).json({ error: 'invalid request' })
    return
  }

  const { provider, modelId } = modelResult.resolved
  const ipCountry = req.headers['x-vercel-ip-country'] as string | undefined

  const trace = langfuse?.trace({
    name: 'apologist-chat',
    sessionId,
    metadata: { journeyId, language, ipCountry, provider, modelId }
  })
  const generation = trace?.generation({
    name: 'apologist-generation',
    model: modelId,
    input: modelMessages,
    prompt: promptClient ?? undefined
  })

  let generationEnded = false
  const endGenerationIfPending = (
    args: Parameters<NonNullable<typeof generation>['end']>[0]
  ): void => {
    if (generationEnded) return
    generationEnded = true
    generation?.end(args)
  }

  try {
    const result = streamText({
      model: modelResult.resolved.model,
      system,
      messages: modelMessages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      onError: async ({ error }) => {
        const err = error as Error
        logger.error(
          {
            provider,
            modelId,
            name: err?.name,
            message: err?.message,
            stack: err?.stack
          },
          '[chat] streamText onError'
        )
        // streamText errors are LLM lifecycle events — record in Langfuse.
        endGenerationIfPending({
          level: 'ERROR',
          statusMessage: err?.message ?? 'stream error'
        })
        await langfuse?.flushAsync()
      },
      onFinish: async ({ text, usage, finishReason }) => {
        if (finishReason === 'error') {
          endGenerationIfPending({
            level: 'ERROR',
            statusMessage: `finishReason=${finishReason}`
          })
          logger.error(
            {
              event: 'apologist_chat_error',
              journeyId,
              journeyTitle,
              language,
              provider,
              modelId,
              finishReason,
              durationMs: Date.now() - startedAt
            },
            '[chat] completed with error'
          )
        } else {
          endGenerationIfPending({
            output: text,
            usage:
              usage != null
                ? {
                    input: usage.inputTokens,
                    output: usage.outputTokens,
                    unit: 'TOKENS'
                  }
                : undefined,
            level: 'DEFAULT'
          })
          // Safe, non-PII observability event — registers that a chat
          // happened, with metadata for troubleshooting. Never logs the
          // user's message text, the reply, or the raw IP.
          logger.info(
            {
              event: 'apologist_chat_completed',
              journeyId,
              journeyTitle,
              language,
              ipCountry,
              sessionId,
              provider,
              modelId,
              messageCount: messages.length,
              inputChars: totalMessageChars(messages),
              promptTokens: usage?.inputTokens,
              completionTokens: usage?.outputTokens,
              finishReason,
              durationMs: Date.now() - startedAt
            },
            '[chat] completed'
          )
        }
        await langfuse?.flushAsync()
      }
    })

    result.pipeUIMessageStreamToResponse(res, {
      onError: (error) => {
        const err = error as Error
        // Pipe-step failures (write to closed socket etc.) are
        // infrastructure errors, not LLM events — logged to Datadog,
        // not recorded in Langfuse.
        logger.error(
          {
            provider,
            modelId,
            name: err?.name,
            message: err?.message
          },
          '[chat] pipe onError'
        )
        // Generic message back to the client — never leak raw error
        // details into the SSE error chunk.
        return 'stream failed'
      }
    })
  } catch (error) {
    const err = error as Error
    logger.error(
      {
        provider,
        modelId,
        name: err?.name,
        message: err?.message
      },
      '[chat] synchronous error'
    )
    // Sync throws happen before the LLM call, but the trace + generation
    // were already created above — close the lifecycle so Langfuse
    // doesn't carry a dangling unfinished span.
    endGenerationIfPending({
      level: 'ERROR',
      statusMessage: err?.message ?? 'sync throw'
    })
    await langfuse?.flushAsync()
    if (!res.headersSent) {
      res.status(500).json({ error: 'upstream streamText failed' })
    } else {
      res.end()
    }
  }
}

async function resolveSystemMessage({
  language,
  langfuse
}: {
  language?: string
  langfuse: Langfuse | null
}): Promise<{ system: string; promptClient: TextPromptClient | null }> {
  const fallback = buildFallbackSystemMessage({ language })
  if (langfuse == null) return { system: fallback, promptClient: null }
  try {
    const promptClient = await langfuse.getPrompt(
      APOLOGIST_PROMPT_NAME,
      undefined,
      { label: getActivePromptLabel() }
    )
    if (promptClient.type !== 'text') {
      logger.warn(
        `[langfuse] expected text prompt for ${APOLOGIST_PROMPT_NAME}, got ${promptClient.type} — using fallback`
      )
      return { system: fallback, promptClient: null }
    }
    const variables: Record<string, string> =
      language != null && language.length > 0 ? { language } : {}
    const compiled = promptClient.compile(variables)
    return { system: compiled, promptClient }
  } catch (error) {
    const err = error as Error
    logger.warn(
      { name: err?.name, message: err?.message },
      '[langfuse] getPrompt failed — using fallback'
    )
    return { system: fallback, promptClient: null }
  }
}

function buildFallbackSystemMessage({
  language
}: {
  language?: string
}): string {
  const parts: string[] = [
    'You are a helpful Christian apologist and spiritual guide.',
    'Be warm, empathetic, and conversational.',
    'Support your answers with relevant Bible passages when appropriate.',
    'Keep responses concise but thorough.'
  ]

  if (language != null && language.length > 0) {
    parts.push(`Respond in the following language: ${language}`)
  }

  return parts.join('\n')
}
