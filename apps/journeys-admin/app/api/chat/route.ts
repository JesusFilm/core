import { google } from '@ai-sdk/google'
import { NoSuchToolError, generateObject, streamText } from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import {
  langfuse,
  langfuseExporter
} from '../../../src/libs/ai/langfuse/server'
import { orchestrateRequest } from '../../../src/libs/ai/orchestrator'
import { getLangfusePrompt } from '../../../src/libs/ai/orchestrator/buildDynamicPrompt'
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

export const messagesSchema = z.array(
  z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })
)

export type Messages = z.infer<typeof messagesSchema>

export async function POST(req: NextRequest) {
  const body = await req.json()
  const schema = z.object({
    messages: messagesSchema,
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

  const langfuseTraceId = uuidv4()

  const systemPrompt = await getLangfusePrompt('base-system-prompt')

  const { classification, finalSystemPrompt, selectedTools } =
    await orchestrateRequest(messages, langfuseTraceId, {
      journeyId,
      selectedStepId,
      selectedBlockId,
      apolloClient: client
    })

  const systemPromptWithClassification = classification
    ? `## User Intent Classification\n\n${classification.reasoning}\n\n${finalSystemPrompt}`
    : finalSystemPrompt

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: messages.filter((message) => message.role !== 'system'),
    system: systemPromptWithClassification,
    tools: selectedTools,
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
        model: google('gemini-2.5-flash'),
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
    maxSteps: 10,
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
