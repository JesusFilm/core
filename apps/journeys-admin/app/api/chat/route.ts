import { google } from '@ai-sdk/google'
import { CoreMessage, streamText } from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
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
    const body = await req.json()
    const schema = z.object({
      messages: z.array(
        z
          .object({
            role: z.enum(['system', 'user', 'assistant']),
            content: z.string()
          })
          .passthrough()
      ),
      journeyId: z.string().optional(),
      selectedStepId: z.string().optional(),
      selectedBlockId: z.string().optional()
    })
    const { messages, journeyId, selectedStepId, selectedBlockId } =
      schema.parse(body)

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

    const langfuseTraceId = uuidv4()

    const messagesWithSystemPrompt = [
      {
        role: 'system',
        content: systemPrompt.compile({
          journeyId: journeyId ?? 'none',
          selectedStepId: selectedStepId ?? 'none',
          selectedBlockId: selectedBlockId ?? 'none'
        })
      },
      ...messages.filter((message) => message.role !== 'system')
    ] as CoreMessage[]

    const result = streamText({
      model: google('gemini-2.0-flash'),
      messages: messagesWithSystemPrompt,
      tools: tools(client),
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          langfuseTraceId,
          langfusePrompt: systemPrompt.toJSON(),
          userId: decoded.user_id,
          sessionId: `${decoded.user_id}-${decoded.auth_time}`
        }
      }
    })

    return result.toDataStreamResponse({
      headers: {
        'Transfer-Encoding': 'chunked',
        Connection: 'keep-alive',
        'x-trace-id': langfuseTraceId
      },
      getErrorMessage: errorHandler
    })
  } finally {
    await langfuseExporter.forceFlush()
  }
}
