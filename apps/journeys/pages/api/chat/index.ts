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

function getChatModel(): LanguageModel {
  const provider = (process.env.CHAT_PROVIDER ?? 'apologist') as ChatProvider

  switch (provider) {
    case 'gemini':
      return google('gemini-2.0-flash')
    case 'openai':
      return openai('gpt-4o')
    case 'apologist':
    default: {
      const apologist = createOpenAICompatible({
        name: 'apologist',
        baseURL: process.env.APOLOGIST_API_URL ?? '',
        apiKey: process.env.APOLOGIST_API_KEY ?? ''
      })
      return apologist.chatModel('openai/gpt/4o')
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

  const result = streamText({
    model: getChatModel(),
    system: systemMessage,
    messages: modelMessages
  })

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
