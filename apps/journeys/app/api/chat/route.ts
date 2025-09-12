import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  getActiveTraceId,
  observe,
  startActiveObservation,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { trace } from '@opentelemetry/api'
import { UIMessage, convertToModelMessages, streamText } from 'ai'
import { after } from 'next/server'

import { flush } from '../../../src/instrumentation'
import { getPrompt } from '../../../src/lib/ai/langfuse/promptHelper'

interface ChatRequestBody {
  messages: UIMessage[]
  contextText?: string
}

export const handler = async (req: Request) => {
  const { messages, contextText }: ChatRequestBody = await req.json()
  // capture once, while context is active
  const activeSpan = trace.getActiveSpan()
  // Set session id and user id on active trace
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
    onFinish: (result) => {
      const latestText = Array.isArray((result as any).content)
        ? [...((result as any).content as Array<any>)]
            .reverse()
            .find((part: any) => part?.type === 'text')?.text
        : (result as any).content

      updateActiveObservation({ output: latestText }, { asType: 'generation' })
      updateActiveTrace({ output: latestText })
      activeSpan?.end()
    }
  })

  // Schedule flush after request is finished
  after(async () => await flush())

  return result.toUIMessageStreamResponse({
    // generateMessageId: () => getActiveTraceId(),
    sendSources: true,
    sendReasoning: true
  })
}

export const POST = observe(handler, {
  name: 'handle-chatbot-message',
  endOnExit: false // end after stream has finished
})
