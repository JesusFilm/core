import { google } from '@ai-sdk/google'
import { updateActiveTrace } from '@langfuse/tracing'
import {
  NoSuchToolError,
  type UIMessage,
  convertToModelMessages,
  generateObject,
  streamText
} from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { messagesSchema } from '../../../src/libs/ai/chatRouteUtils'
import {
  getLangfuseEnvironment,
  langfuse,
  langfuseSpanProcessor
} from '../../../src/libs/ai/langfuse/server'

const intentSchema = z.object({
  intent: z.enum([
    'journey_design',
    'general_chat',
    'other'
  ])
})

type RouterIntent = z.infer<typeof intentSchema>['intent']

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.messages == null) {
    return Response.json(
      {
        error: 'Missing or invalid request body: messages array is required',
        detail:
          'The chat client must send { messages: [{ role, parts }, ...], ... }. Received keys: ' +
          Object.keys(body).join(', ')
      },
      { status: 400 }
    )
  }

  const bodySchema = z.object({
    messages: messagesSchema,
    journeyId: z.string().optional(),
    selectedStepId: z.string().optional(),
    selectedBlockId: z.string().optional(),
    sessionId: z.string().optional()
  })
  
  const parseResult = bodySchema.safeParse(body)
  if (!parseResult.success) {
    return Response.json(
      { error: 'Invalid request body', detail: parseResult.error.flatten() },
      { status: 400 }
    )
  }
  const { messages: uiMessages, journeyId, selectedStepId, selectedBlockId, sessionId } =
    parseResult.data

  const modelMessages = await convertToModelMessages(
    uiMessages as Array<Omit<UIMessage, 'id'>>
  )

  const token = req.headers.get('Authorization')

  if (token == null)
    return Response.json({ error: 'Missing token' }, { status: 400 })
  const decoded = z
    .object({
      user_id: z.string(),
      auth_time: z.number()
    })
    .parse(jwtDecode(token.split(' ')[1]))

  const langfuseTraceId = uuidv4()

  const langfuseEnv = getLangfuseEnvironment()

  let routerIntent: RouterIntent = 'general_chat'
  try {
    const routerPrompt = (await langfuse.prompt.get('system/api/chat/intent-classifier', {
      label: langfuseEnv,
      cacheTtlSeconds: ['Development', 'preview'].includes(langfuseEnv) ? 0 : 60
    })) as any

    const lastUserMessage =
      [...uiMessages].reverse().find((message) => message.role === 'user') ??
      null

    const routerInput =
      lastUserMessage != null
        ? JSON.stringify({
            role: lastUserMessage.role,
            parts: lastUserMessage.parts,
            metadata: lastUserMessage.metadata
          })
        : 'No user message available to classify.'

    const routerResult = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: intentSchema,
      system: routerPrompt.compile(),
      prompt: routerInput
    })

    routerIntent = routerResult.object.intent
  } catch {
    routerIntent = 'general_chat'
  }

  const corePrompt = (await langfuse.prompt.get('system/api/chat/core', {
    label: langfuseEnv,
    cacheTtlSeconds: ['Development', 'preview'].includes(langfuseEnv) ? 0 : 60
  })) as any

  let intentPrompt:
    | Awaited<ReturnType<(typeof langfuse)['prompt']['get']>>
    | null = null

  if (routerIntent === 'journey_design') {
    intentPrompt = (await langfuse.prompt.get(
      'system/api/chat/journey-design',
      {
        label: langfuseEnv,
        cacheTtlSeconds: ['Development', 'preview'].includes(langfuseEnv)
          ? 0
          : 60
      }
    )) as any
  }

  const system = [
    corePrompt.compile({
      journeyId: journeyId ?? 'none',
      selectedStepId: selectedStepId ?? 'none',
      selectedBlockId: selectedBlockId ?? 'none'
    }),
    intentPrompt?.compile()
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: modelMessages.filter((message) => message.role !== 'system'),
    system,
    // tools: tools(client, { langfuseTraceId }),
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'ai-chat-stream',
      metadata: {
        langfuseTraceId,
        langfuseCorePrompt: corePrompt.toJSON(),
        routerIntent,
        userId: decoded.user_id,
        sessionId: sessionId ?? `${decoded.user_id}-${decoded.auth_time}`,
        ...(intentPrompt && { langfuseIntentPrompt: intentPrompt.toJSON() })
      }
    },
    // Repair disabled: AI SDK no longer exposes tool.parameters (Zod) on tools;
    // only inputSchema (JSONSchema7) is available, and generateObject expects Zod.
    experimental_repairToolCall: async ({ error }) => {
      if (NoSuchToolError.isInstance(error)) return null
      return null // TODO: re-enable when SDK supports repair with current tool types
    },
    onFinish: async (_result) => {
      updateActiveTrace({ tags: ['output-added'] })
      await langfuseSpanProcessor.forceFlush()
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
