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

import { getFlags } from '../../../src/libs/getFlags'
import {
  APOLOGIST_PROMPT_NAME,
  getActivePromptLabel,
  getLangfuse
} from '../../../src/libs/langfuse/client'

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

interface ChatRequestBody {
  messages: UIMessage[]
  language?: string
  sessionId?: string
  journeyId?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
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

  const { messages, language, sessionId, journeyId } =
    req.body as ChatRequestBody

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'messages are required' })
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
  const modelMessages = await convertToModelMessages(messages)

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
      onError: ({ error }) => {
        const err = error as Error
        console.error('[chat] streamText onError', {
          provider,
          modelId,
          name: err?.name,
          message: err?.message,
          stack: err?.stack
        })
        endGenerationIfPending({
          level: 'ERROR',
          statusMessage: err?.message ?? 'stream error'
        })
      },
      onFinish: ({ text, usage, finishReason }) => {
        if (finishReason === 'error') {
          endGenerationIfPending({
            level: 'ERROR',
            statusMessage: `finishReason=${finishReason}`
          })
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
        }
      }
    })

    result.pipeUIMessageStreamToResponse(res, {
      onError: (error) => {
        const err = error as Error
        console.error('[chat] pipe onError', {
          provider,
          modelId,
          name: err?.name,
          message: err?.message
        })
        endGenerationIfPending({
          level: 'ERROR',
          statusMessage: err?.message ?? 'pipe error'
        })
        return err?.message ?? 'stream failed'
      }
    })
  } catch (error) {
    const err = error as Error
    console.error('[chat] synchronous error', {
      provider,
      modelId,
      name: err?.name,
      message: err?.message
    })
    endGenerationIfPending({
      level: 'ERROR',
      statusMessage: err?.message ?? 'sync throw'
    })
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: err?.message ?? 'upstream streamText failed' })
    } else {
      res.end()
    }
  }

  // Keep the lambda alive until the response stream has actually finished
  // writing, then ship the trace in a single awaited flush. This is the
  // only place data is sent to Langfuse — every callback above only updates
  // local state via endGenerationIfPending. Awaiting here guarantees the
  // HTTPS POST completes before Vercel can freeze the function.
  await new Promise<void>((resolve) => {
    if (res.writableEnded) {
      resolve()
      return
    }
    res.once('close', resolve)
  })
  await langfuse?.flushAsync()
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
      console.warn(
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
    console.warn('[langfuse] getPrompt failed — using fallback', {
      name: err?.name,
      message: err?.message
    })
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
