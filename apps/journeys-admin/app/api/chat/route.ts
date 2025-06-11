import { google } from '@ai-sdk/google'
import { coreMessageSchema, streamText } from 'ai'
import { NextRequest } from 'next/server'
import { z } from 'zod'

import { langfuse } from '../../../src/libs/ai/langfuse'
import { tools } from '../../../src/libs/ai/tools'
import { createApolloClient } from '../../../src/libs/apolloClient'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export const runtime = 'edge'

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return JSON.stringify(error)
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const parsedMessages = z.array(coreMessageSchema).parse(messages)

  const token = req.headers.get('Authorization')

  if (token == null)
    return Response.json({ error: 'Missing token' }, { status: 400 })

  const client = createApolloClient(token.split(' ')[1])

  const systemPrompt = await langfuse.getPrompt('ai-chat-system-prompt')

  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages: [
      {
        role: 'system',
        content: systemPrompt.prompt ?? ''
      },
      ...parsedMessages.filter((message) => message.role !== 'system')
    ],
    tools: tools(client),
    experimental_telemetry: {
      isEnabled: true
    }
  })

  return result.toDataStreamResponse({
    headers: {
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive'
    },
    getErrorMessage: errorHandler
  })
}
