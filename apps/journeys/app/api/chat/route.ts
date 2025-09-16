import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { trace } from '@opentelemetry/api'
import { convertToModelMessages, streamText } from 'ai'
import { NextRequest, after } from 'next/server'

import { langfuseSpanProcessor } from '../../../instrumentation'
import { getPrompt } from '../../../src/lib/ai/langfuse/promptHelper'

const handler = async (req: NextRequest) => {
  const { messages, contextText, sessionId, journeyId, userId } =
    await req.json()

  const inputText = messages[messages.length - 1].parts.find(
    (part) => part.type === 'text'
  )?.text

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

  const systemPrompt = await getPrompt('Chat-Prompt', { contextText })

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: convertToModelMessages(messages),
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
