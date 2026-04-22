import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  type LanguageModel,
  UIMessage,
  convertToModelMessages,
  streamText
} from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../../src/libs/getFlags'

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
      process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash-lite'
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
  // Model id matches the proven upstream smoke test
  // (scripts/apologist-test.sh).
  const modelId = 'openai/gpt/4o-mini'
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

  const { messages, language } = req.body as ChatRequestBody

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'messages are required' })
    return
  }

  const modelResult = resolveChatModel()
  if (!modelResult.ok) {
    res.status(503).json({ error: modelResult.error })
    return
  }

  const systemMessage = buildSystemMessage({ language })
  const modelMessages = await convertToModelMessages(messages)

  const { provider, modelId } = modelResult.resolved

  try {
    const result = streamText({
      model: modelResult.resolved.model,
      system: systemMessage,
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
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: err?.message ?? 'upstream streamText failed' })
    } else {
      res.end()
    }
  }
}

function buildSystemMessage({ language }: { language?: string }): string {
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
