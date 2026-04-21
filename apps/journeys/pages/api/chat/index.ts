import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  type LanguageModel,
  UIMessage,
  UIMessageChunk,
  convertToModelMessages,
  createUIMessageStream,
  generateText,
  pipeUIMessageStreamToResponse
} from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getFlags } from '../../../src/libs/getFlags'

type ChatProvider = 'apologist' | 'gemini' | 'openai'

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

  // TODO(NES-1554 follow-up): the upstream openai-compatible SSE stream is
  // not decoded correctly by @ai-sdk/openai-compatible (empty text + empty
  // usage). We use generateText + a synthesised UIMessageStream so the
  // client still receives a valid AI SDK stream. Revisit once upstream or
  // the SDK is fixed.
  try {
    const { text, finishReason } = await generateText({
      model: modelResult.resolved.model,
      system: systemMessage,
      messages: modelMessages
    })

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const textId = `text-${Date.now()}`
        writer.write({ type: 'start' } as UIMessageChunk)
        writer.write({ type: 'start-step' } as UIMessageChunk)
        writer.write({ type: 'text-start', id: textId } as UIMessageChunk)
        writer.write({
          type: 'text-delta',
          id: textId,
          delta: text ?? ''
        } as UIMessageChunk)
        writer.write({ type: 'text-end', id: textId } as UIMessageChunk)
        writer.write({ type: 'finish-step' } as UIMessageChunk)
        writer.write({ type: 'finish', finishReason } as UIMessageChunk)
      }
    })

    pipeUIMessageStreamToResponse({ response: res, stream })
  } catch (error) {
    const err = error as Error
    console.error('apologist chat error', err?.message)
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: err?.message ?? 'upstream generateText failed' })
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
