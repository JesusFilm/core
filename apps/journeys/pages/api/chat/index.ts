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

import { getCardChatEnabled } from '../../../src/libs/getCardChatEnabled'
import { getFlags } from '../../../src/libs/getFlags'
import {
  APOLOGIST_PROMPT_NAME,
  getActivePromptLabel,
  getLangfuse
} from '../../../src/libs/langfuse/client'
import { logger } from '../../../src/libs/logger'

// Request bounds (NES-1579). Hard ceilings so a single chat request can't be
// arbitrarily expensive or arbitrarily shaped.
// Array-length cap on conversation turns. Raised 20 → 40 in NES-1663 so legit
// deep conversations don't hit a silent reject at ~8-10 turns.
const MAX_MESSAGES = 40
const MAX_PARTS_PER_MESSAGE = 20
// Applied per field — once on `content` and once on each `parts[].text` —
// so a single message can carry more than this in aggregate. The
// MAX_TOTAL_CHARS budget below is the real per-request backstop.
// Keep in sync with the per-message cap MAX_MESSAGE_CHARS in
// libs/journeys/ui/src/components/PromptInput/PromptInput.tsx — the UI
// caps typing/pasting at that length and the server rejects any single
// field longer than it, so the two constants must match.
const MAX_FIELD_CHARS = 4000
// ~10k input-token budget at ~4 chars/token (raised 20000 → 40000 in
// NES-1663). Buys ~16-20 turns of normal conversation before the cap bites.
// When it is still hit, the handler logs `chat_conversation_capped` and the
// client shows a catered "start a fresh conversation" message instead of a
// dead-end Retry. Conversation-history management (sliding window / rolling
// summary) stays deferred — revive only if cap-hits prove frequent at volume.
const MAX_TOTAL_CHARS = 40000
const MAX_OUTPUT_TOKENS = 512

export const config = {
  api: {
    // Scales with the MAX_TOTAL_CHARS budget: 4-byte-per-char UTF-8 worst case
    // (international users) + JSON wrapping. Raised 128kb → 256kb in NES-1663
    // alongside the char budget — it *must* track it or oversized bodies 413
    // before the handler runs.
    bodyParser: { sizeLimit: '256kb' }
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
  // Required (NES-1679): a missing journeyId is a malformed request, not a
  // killed card. Requiring it returns 400 invalid_request instead of routing
  // through the kill switch to a 403 chat_disabled (which would show users the
  // "chat turned off" copy and pollute the chat_card_disabled signal). Matches
  // the required cardId below.
  journeyId: z.string().min(1).max(128),
  // Required (NES-1679): the server reads the card's `showAssistant` to enforce
  // the per-card chat kill switch, so every request must say which card it is.
  cardId: z.string().min(1).max(128)
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
    // `code` so the client can recognise a deterministic flag-off and hide
    // Retry (re-firing would 404 again). See the error-code contract note at
    // the cap-hit branch below.
    res.status(404).json({ error: 'not found', code: 'not_found' })
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const parsed = chatRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid request', code: 'invalid_request' })
    return
  }
  const { messages, language, sessionId, journeyId, cardId } = parsed.data

  const promptChars = totalMessageChars(messages)
  if (promptChars > MAX_TOTAL_CHARS) {
    // Expected, user-driven condition (a deep conversation outgrew the cap),
    // not a backend fault — `warn`, not `error`, so it stays out of error
    // alerts. Tracked with a single Datadog query
    // (`service:journeys event:chat_conversation_capped`); the decision to
    // revive history-windowing keys off this frequency.
    logger.warn(
      {
        event: 'chat_conversation_capped',
        sessionId,
        journeyId,
        language,
        messageCount: messages.length,
        promptChars
      },
      'chat conversation hit size cap'
    )
    // Error-code contract: AI SDK v6's transport discards the HTTP status and
    // surfaces only the response body as `error.message`, so a structured
    // `code` is how the client distinguishes failures. `conversation_capped`
    // drives both the catered cap-hit message and retry-gating in
    // libs/journeys/ui/src/components/AiChat/AiChat.tsx.
    res
      .status(400)
      .json({ error: 'request too large', code: 'conversation_capped' })
    return
  }

  // Per-card kill switch (NES-1679): the card's `showAssistant` is enforced
  // server-side so flipping it off in the editor stops chat for tabs that are
  // already open, on their very next message. Runs after the cheap local
  // schema/size checks so an obviously-bad request never reaches the gateway.
  const chatEnabled = await getCardChatEnabled({ journeyId, cardId })
  if (!chatEnabled) {
    logger.warn(
      { event: 'chat_card_disabled', journeyId, cardId, sessionId },
      '[chat] blocked: chat disabled for card'
    )
    // `code` keeps the client's error-code contract: a disabled card is
    // deterministic, so the client hides Retry (re-firing would 403 again).
    res
      .status(403)
      .json({ error: 'chat disabled for this card', code: 'chat_disabled' })
    return
  }

  const modelResult = resolveChatModel()
  if (!modelResult.ok) {
    res.status(503).json({ error: modelResult.error })
    return
  }

  const { provider, modelId } = modelResult.resolved
  const ipCountry = req.headers['x-vercel-ip-country'] as string | undefined
  // Shared non-PII context spread into every observability event so the
  // success event and all error events stay queryable on the same fields in
  // Datadog. The `event` tag stays unique per failure site; these fields stay
  // common. `turn` = user-message ordinal (1, 2, 3…); `promptChars` = full
  // prompt size this turn. Both climb across a session because the whole
  // history is resent each turn — count events per session for volume, max()
  // for depth; never sum these. Never includes message text, the model reply,
  // or the raw IP.
  const chatLogContext = {
    journeyId,
    // `cardId` is recorded on every chat event (NES-1679) so the kill switch's
    // allow path is queryable: on a "killed card still chatting" report the
    // success/error events show which card the server actually consulted, which
    // is the signal needed to tell a request-identity mismatch apart from a
    // stale read — without a per-message log on the lookup itself.
    cardId,
    language,
    ipCountry,
    sessionId,
    provider,
    modelId,
    turn: messages.filter((m) => m.role === 'user').length,
    promptChars: totalMessageChars(messages)
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
      {
        event: 'apologist_chat_convert_error',
        ...chatLogContext,
        name: err?.name,
        message: err?.message,
        durationMs: Date.now() - startedAt
      },
      '[chat] convertToModelMessages failed'
    )
    res.status(400).json({ error: 'invalid request', code: 'invalid_request' })
    return
  }

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
            event: 'apologist_chat_stream_error',
            ...chatLogContext,
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
            durationMs: Date.now() - startedAt
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
              ...chatLogContext,
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
              ...chatLogContext,
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
            event: 'apologist_chat_pipe_error',
            ...chatLogContext,
            name: err?.name,
            message: err?.message,
            durationMs: Date.now() - startedAt
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
        event: 'apologist_chat_sync_error',
        ...chatLogContext,
        name: err?.name,
        message: err?.message,
        durationMs: Date.now() - startedAt
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

// Bible translation compiled into the Langfuse prompt's {{translation}} variable
// (and named in the local fallback). Hardcoded for now and centralised here so
// we can swap translations later without touching the prompt (NES-1736).
const BIBLE_TRANSLATION = 'ESV'

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
    // Always supply `translation` so the prompt's {{translation}} variable
    // resolves (otherwise Langfuse leaves the literal placeholder in the
    // compiled prompt). `language` is only added when known.
    const variables: Record<string, string> = { translation: BIBLE_TRANSLATION }
    if (language != null && language.length > 0) {
      variables.language = language
    }
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
    `Quote from the ${BIBLE_TRANSLATION} Bible.`,
    'Keep responses concise but thorough.'
  ]

  if (language != null && language.length > 0) {
    // Default to the journey's language, but if the user writes in a different
    // language, answer in that language instead (NES-1736). Mirrors the
    // Langfuse system prompt's language instruction so the fallback behaves the
    // same when Langfuse is unavailable.
    parts.push(
      `Default to responding in ${language}. If the user writes in a different language, respond in that language instead.`
    )
  }

  return parts.join('\n')
}
