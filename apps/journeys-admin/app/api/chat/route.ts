import { google } from '@ai-sdk/google'
import { NoSuchToolError, generateObject, streamText } from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import {
  langfuse,
  langfuseEnvironment,
  langfuseExporter
} from '../../../src/libs/ai/langfuse/server'
import { tools } from '../../../src/libs/ai/tools'
import { createApolloClient } from '../../../src/libs/apolloClient'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

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
    selectedBlockId: z.string().optional(),
    sessionId: z.string().optional()
  })
  const { messages, journeyId, selectedStepId, selectedBlockId, sessionId } =
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
    //'ai-chat-system-prompt',
    //'system/api/chat/route',
    'ai-chat-youtube',
    undefined,
    {
      label: langfuseEnvironment,
      cacheTtlSeconds: ['development', 'preview'].includes(langfuseEnvironment)
        ? 0
        : 60
    }
  )

  const langfuseTraceId = uuidv4()

  const result = streamText({
    model: google('gemini-2.0-flash'),
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
    experimental_repairToolCall: async ({
      toolCall,
      tools,
      parameterSchema,
      error
    }) => {
      if (NoSuchToolError.isInstance(error)) return null // do not attempt to fix invalid tool names

      const tool = tools[toolCall.toolName]

      const { object: repairedArgs } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: tool.parameters,
        prompt: [
          `The model tried to call the tool "${toolCall.toolName}"` +
            ` with the following arguments:`,
          JSON.stringify(toolCall.args),
          `The tool accepts the following schema:`,
          JSON.stringify(parameterSchema(toolCall)),
          'Please fix the arguments.'
        ].join('\n')
      })
      return { ...toolCall, args: JSON.stringify(repairedArgs) }
    },
    maxSteps: 5,
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

  return result.toDataStreamResponse({
    headers: {
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive',
      'x-trace-id': langfuseTraceId
    },
    getErrorMessage: errorHandler
  })
}
