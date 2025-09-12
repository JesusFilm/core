import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  getActiveTraceId,
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { trace } from '@opentelemetry/api'
import { UIMessage, convertToModelMessages, streamText } from 'ai'
import { after } from 'next/server'

import { flush } from '../../../src/instrumentation'
import { getPrompt } from '../../../src/lib/ai/langfuse/promptHelper'

export const runtime = 'nodejs'

interface ChatRequestBody {
  messages: UIMessage[]
  contextText?: string
}

export const handler = async (req: Request) => {
  const { messages, contextText }: ChatRequestBody = await req.json()

  const inputText = messages[messages.length - 1].parts.find(
    (part) => part.type === 'text'
  )?.text

  updateActiveObservation({ input: inputText }, { asType: 'generation' })

  updateActiveTrace({
    name: 'QA-Chatbot',
    sessionId: 'test-chatId', // TODO: map
    userId: 'test-userId', // TODO: map
    input: inputText
  })

  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: `${process.env.APOLOGIST_API_URL}`
  })

  const systemPrompt = await getPrompt('Chat-Prompt', { contextText })

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    experimental_telemetry: {
      isEnabled: true
    },
    onFinish: (result) => {
      const latestText = Array.isArray((result as any).content)
        ? [...((result as any).content as Array<any>)]
            .reverse()
            .find((part: any) => part?.type === 'text')?.text
        : (result as any).content

      updateActiveObservation({ output: latestText }, { asType: 'generation' })
      updateActiveTrace({ output: latestText })

      // End the active span
      trace.getActiveSpan()?.end()
    }
  })

  after(async () => {
    try {
      // Small delay to ensure span processing is complete
      await new Promise((resolve) => setTimeout(resolve, 100))
      await flush()
    } catch (error) {
      console.warn('[journeys] Chat flush error:', error.message)
    }
  })

  return result.toUIMessageStreamResponse({
    generateMessageId: () => getActiveTraceId() ?? crypto.randomUUID(),
    sendSources: true,
    sendReasoning: true
  })
}

export const POST = observe(handler, {
  name: 'handle-chat-message',
  endOnExit: false // Important for streaming responses
})
