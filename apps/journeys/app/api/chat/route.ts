import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import {
  ModelMessage,
  UIMessage,
  type UserModelMessage,
  convertToModelMessages,
  streamText
} from 'ai'
import { NextRequest, after } from 'next/server'

import { InteractionType } from '@core/journeys/ui/AiChat/InteractionStarter'

import { flush } from '../../../instrumentation'
import { getPrompt } from '../../../src/lib/ai/langfuse/promptHelper'

const traceName = 'ai-assistant-chat'

function getPromptType(interactionType?: InteractionType): string {
  switch (interactionType) {
    case 'explain':
      return 'explain-prompt'
    case 'reflect':
      return 'reflect-prompt'
    default:
      return 'Chat-Prompt'
  }
}

interface ChatRequest {
  messages: UIMessage[]
  contextText?: string
  language?: string
  sessionId?: string
  journeyId?: string
  userId?: string
  interactionType?: InteractionType
}

const handler = async (req: NextRequest) => {
  const {
    messages,
    contextText,
    language,
    sessionId,
    journeyId,
    userId,
    interactionType
  }: ChatRequest = await req.json()

  const modelMessages: ModelMessage[] = convertToModelMessages(messages)

  const userMessages = modelMessages.filter(
    (message) => message.role === 'user'
  )

  const lastUserMessage: UserModelMessage =
    userMessages[userMessages.length - 1]

  const firstContent = lastUserMessage.content[0]

  const inputText =
    typeof firstContent === 'string'
      ? firstContent
      : 'type' in firstContent && firstContent.type === 'text'
        ? firstContent.text
        : '' // fallback for other content types

  updateActiveObservation({
    input: inputText
  })

  updateActiveTrace({
    name: traceName,
    sessionId: sessionId,
    userId: userId,
    input: inputText,
    metadata: {
      journeyId: journeyId,
      language
    }
  })

  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: process.env.APOLOGIST_API_URL ?? ''
  })

  const systemPrompt = await getPrompt(getPromptType(interactionType), {
    contextText,
    language
  })

  // Build telemetry metadata without undefined values
  const telemetryMetadata: Record<string, string | boolean> = {
    hasContext: !!contextText
  }
  if (interactionType) telemetryMetadata.interactionType = interactionType
  if (journeyId) telemetryMetadata.journeyId = journeyId
  if (userId) telemetryMetadata.userId = userId
  if (sessionId) telemetryMetadata.sessionId = sessionId

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: modelMessages,
    system: systemPrompt,
    experimental_telemetry: {
      isEnabled: true,
      metadata: telemetryMetadata
    },
    onFinish: ({ text, usage }) => {
      updateActiveObservation({
        output: text,
        metadata: {
          textLength: text.length,
          messageCount: modelMessages.length,
          ...(usage && { usage })
        }
      })
      updateActiveTrace({
        name: traceName,
        output: text,
        metadata: {
          textLength: text.length,
          ...(usage && { usage })
        }
      })
    }
  })

  // Important in serverless environments: schedule flush after request is finished
  after(async () => await flush())

  return result.toUIMessageStreamResponse()
}

export const POST = observe(handler, {
  name: traceName,
  endOnExit: false // end observation _after_ stream has finished
})
