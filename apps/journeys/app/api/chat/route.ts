import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { trace } from '@opentelemetry/api'
import { ModelMessage, UIMessage, convertToModelMessages, streamText } from 'ai'
import { NextRequest, after } from 'next/server'

import { InteractionType } from '@core/journeys/ui/AiChat/InteractionStarter'

import { langfuseSpanProcessor } from '../../../instrumentation'
import { getPrompt } from '../../../src/lib/ai/langfuse/promptHelper'

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
  sessionId?: string
  journeyId?: string
  userId?: string
  interactionType?: InteractionType
}

const handler = async (req: NextRequest) => {
  const {
    messages,
    contextText,
    sessionId,
    journeyId,
    userId,
    interactionType
  }: ChatRequest = await req.json()

  const modelMessages: ModelMessage[] = convertToModelMessages(messages)

  const userMessages = modelMessages.filter(
    (message) => message.role === 'user'
  )

  const lastUserMessage = userMessages[userMessages.length - 1]

  const inputText =
    typeof lastUserMessage?.content === 'string' ? lastUserMessage.content : ''

  updateActiveObservation({
    input: inputText
  })

  updateActiveTrace({
    name: 'ai-assistant-chat',
    sessionId: sessionId,
    userId: userId,
    input: inputText,
    metadata: {
      journeyId: journeyId
    }
  })

  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: process.env.APOLOGIST_API_URL ?? ''
  })

  const systemPrompt = await getPrompt(getPromptType(interactionType), {
    contextText
  })

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: modelMessages,
    system: systemPrompt,
    experimental_telemetry: {
      isEnabled: true
    },
    onFinish: ({ text }) => {
      updateActiveObservation({
        output: text
      })
      updateActiveTrace({
        output: text
      })

      // End span manually after stream has finished
      trace.getActiveSpan()?.end()
    }
  })

  // Important in serverless environments: schedule flush after request is finished
  after(async () => await langfuseSpanProcessor.forceFlush())

  return result.toUIMessageStreamResponse()
}

export const POST = observe(handler, {
  name: 'chat-message',
  endOnExit: false // end observation _after_ stream has finished
})
