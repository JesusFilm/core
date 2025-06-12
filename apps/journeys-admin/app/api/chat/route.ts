import { google } from '@ai-sdk/google'
import { coreMessageSchema, streamText } from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { z } from 'zod'

import {
  langfuse,
  langfuseEnvironment,
  langfuseExporter
} from '../../../src/libs/ai/langfuse'
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
  try {
    const { messages, journeyId, selectedStepId, selectedBlockId } =
      await req.json()

    const parsedMessages = z.array(coreMessageSchema).parse(messages)

    const token = req.headers.get('Authorization')

    if (token == null)
      return Response.json({ error: 'Missing token' }, { status: 400 })

    const decoded = z
      .object({
        user_id: z.string(),
        auth_time: z.number()
      })
      .parse(jwtDecode(token.split(' ')[1]))

    const client = createApolloClient(token.split(' ')[1])

    const systemPrompt = await langfuse.getPrompt(
      'ai-chat-system-prompt',
      undefined,
      {
        label: langfuseEnvironment,
        cacheTtlSeconds: process.env.VERCEL_ENV === 'preview' ? 0 : 60
      }
    )

    const result = streamText({
      model: google('gemini-2.0-flash'),
      messages: [
        {
          role: 'system',
          content: systemPrompt.compile({
            journeyId: journeyId ?? 'none',
            selectedStepId: selectedStepId ?? 'none',
            selectedBlockId: selectedBlockId ?? 'none'
          })
        },
        ...parsedMessages.filter((message) => message.role !== 'system')
      ],
      tools: tools(client),
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          langfusePrompt: systemPrompt.toJSON(),
          userId: decoded.user_id,
          sessionId: `${decoded.user_id}-${decoded.auth_time}`
        }
      }
    })

    return result.toDataStreamResponse({
      headers: {
        'Transfer-Encoding': 'chunked',
        Connection: 'keep-alive'
      },
      getErrorMessage: errorHandler
    })
  } finally {
    await langfuseExporter.forceFlush()
  }
}
