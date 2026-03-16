import { google } from '@ai-sdk/google'
import { NoSuchToolError, streamText } from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { messagesSchema } from '../../../src/libs/ai/chatRouteUtils'
import {
  langfuse,
  langfuseEnvironment,
  langfuseExporter
} from '../../../src/libs/ai/langfuse/server'
import { tools } from '../../../src/libs/ai/tools'
import { createApolloClient } from '../../../src/libs/apolloClient'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.messages == null) {
    return Response.json(
      {
        error: 'Missing or invalid request body: messages array is required',
        detail: 'The chat client must send { messages: [{ role, content }], ... }. Received keys: ' +
          Object.keys(body).join(', ')
      },
      { status: 400 }
    )
  }
  const schema = z.object({
    messages: messagesSchema,
    journeyId: z.string().optional(),
    selectedStepId: z.string().optional(),
    selectedBlockId: z.string().optional(),
    sessionId: z.string().optional()
  })
  const parseResult = schema.safeParse(body)
  if (!parseResult.success) {
    return Response.json(
      { error: 'Invalid request body', detail: parseResult.error.flatten() },
      { status: 400 }
    )
  }
  const { messages, journeyId, selectedStepId, selectedBlockId, sessionId } =
    parseResult.data

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

  const langfuseTraceId = uuidv4()

  const systemPrompt = await langfuse.getPrompt(
    'system/api/chat/route',
    undefined,
    {
      label: langfuseEnvironment,
      cacheTtlSeconds: ['development', 'preview'].includes(langfuseEnvironment)
        ? 0
        : 60
    }
  )

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: messages.filter((message) => message.role !== 'system'),
    system: systemPrompt.compile({
      journeyId: journeyId ?? 'none',
      selectedStepId: selectedStepId ?? 'none',
      selectedBlockId: selectedBlockId ?? 'none'
    }),
    tools: tools(client, { langfuseTraceId }),
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'ai-chat-stream',
      metadata: {
        langfuseTraceId,
        langfusePrompt: systemPrompt.toJSON(),
        userId: decoded.user_id,
        sessionId: sessionId ?? `${decoded.user_id}-${decoded.auth_time}`
      }
    },
    // Repair disabled: AI SDK no longer exposes tool.parameters (Zod) on tools;
    // only inputSchema (JSONSchema7) is available, and generateObject expects Zod.
    experimental_repairToolCall: async ({ error }) => {
      if (NoSuchToolError.isInstance(error)) return null
      return null // TODO: re-enable when SDK supports repair with current tool types
    },
    onFinish: async (result) => {
      await langfuseExporter.forceFlush()
      const trace = langfuse.trace({
        id: langfuseTraceId
      })
      await trace.update({
        output: result.text,
        tags: ['output-added']
      })
    }
  })

  return result.toUIMessageStreamResponse({
    headers: {
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive',
      'x-trace-id': langfuseTraceId
    }
  })
}
