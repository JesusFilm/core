import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import {
  type LanguageModel,
  UIMessage,
  convertToModelMessages,
  streamText
} from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

type ChatProvider = 'apologist' | 'gemini' | 'openai'

function getChatModel(): { model: LanguageModel; provider: ChatProvider; modelId: string; baseURL?: string } {
  const provider = (process.env.CHAT_PROVIDER ?? 'apologist') as ChatProvider

  switch (provider) {
    case 'gemini':
      return { model: google('gemini-2.0-flash'), provider, modelId: 'gemini-2.0-flash' }
    case 'openai':
      return { model: openai('gpt-4o'), provider, modelId: 'gpt-4o' }
    case 'apologist':
    default: {
      const baseURL = process.env.APOLOGIST_API_URL ?? ''
      const apologist = createOpenAICompatible({
        name: 'apologist',
        baseURL,
        apiKey: process.env.APOLOGIST_API_KEY ?? ''
      })
      const modelId = 'openai/gpt/4o'
      return { model: apologist.chatModel(modelId), provider: 'apologist', modelId, baseURL }
    }
  }
}

interface ChatRequestBody {
  messages: UIMessage[]
  contextText?: string
  language?: string
  interactionType?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  console.log('[apologist:server] handler=chat method=', req.method)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const {
    messages,
    contextText,
    language,
    interactionType
  } = req.body as ChatRequestBody

  console.log(
    '[apologist:server] request payload messageCount=',
    messages?.length ?? 0,
    'contextText.length=',
    contextText?.length ?? 0,
    'language=',
    language,
    'interactionType=',
    interactionType
  )

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'messages are required' })
    return
  }

  const systemMessage = buildSystemMessage({
    contextText,
    language,
    interactionType
  })

  const modelMessages = await convertToModelMessages(messages)

  const { model, provider, modelId, baseURL } = getChatModel()
  console.log(
    '[apologist:server] model resolved provider=',
    provider,
    'modelId=',
    modelId,
    'baseURL=',
    baseURL ?? '(provider default)'
  )

  const result = streamText({
    model,
    system: systemMessage,
    messages: modelMessages,
    onChunk({ chunk }) {
      const preview =
        chunk.type === 'text-delta' || chunk.type === 'reasoning-delta'
          ? (chunk.text ?? '').slice(0, 80)
          : undefined
      console.log(
        '[apologist:server] onChunk type=',
        chunk.type,
        preview !== undefined ? `preview="${preview}"` : ''
      )
    },
    onFinish({ text, finishReason, usage, toolCalls }) {
      console.log(
        '[apologist:server] onFinish finishReason=',
        finishReason,
        'usage=',
        JSON.stringify(usage),
        'text.length=',
        text?.length ?? 0,
        'toolCalls=',
        toolCalls?.length ?? 0
      )
    },
    onError({ error }) {
      const err = error as Error
      console.error(
        '[apologist:server] onError message=',
        err?.message,
        'stack=',
        err?.stack,
        'raw=',
        error
      )
    }
  })

  console.log(
    '[apologist:server] response protocol=pipeUIMessageStreamToResponse (UI Message Stream / Data Stream Protocol)'
  )
  result.pipeUIMessageStreamToResponse(res)
}

function buildSystemMessage({
  contextText,
  language,
  interactionType
}: {
  contextText?: string
  language?: string
  interactionType?: string
}): string {
  const parts: string[] = [
    'You are a helpful Christian apologist and spiritual guide.',
    'Be warm, empathetic, and conversational.',
    'Support your answers with relevant Bible passages when appropriate.',
    'Keep responses concise but thorough.'
  ]

  if (contextText != null && contextText.length > 0) {
    parts.push(
      `The user is currently viewing content with the following context: ${contextText}`
    )
  }

  if (language != null && language.length > 0) {
    parts.push(`Respond in the following language: ${language}`)
  }

  if (interactionType != null && interactionType.length > 0) {
    parts.push(`The user wants to: ${interactionType}`)
  }

  return parts.join('\n')
}
