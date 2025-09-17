import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  observe,
  updateActiveObservation,
  updateActiveTrace
} from '@langfuse/tracing'
import { trace } from '@opentelemetry/api'
import { convertToModelMessages, streamText } from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'

import { langfuseSpanProcessor } from '../../instrumentation'
import { getPrompt } from '../../src/libs/ai/langfuse/promptHelper'

type ChatRequestBody = {
  messages: Array<{
    parts: Array<{ type: string; text?: string }>
  }>
  contextText?: string
  sessionId?: string
  journeyId?: string
  userId?: string
}

export const chatHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { messages, contextText, sessionId, journeyId, userId } =
    (req.body as ChatRequestBody) ?? {}

  const inputText = messages?.[messages.length - 1]?.parts.find(
    (part) => part.type === 'text'
  )?.text

  updateActiveObservation({
    input: inputText
  })

  updateActiveTrace({
    name: 'ai-assistant-chat',
    sessionId,
    userId,
    input: inputText,
    metadata: {
      journeyId
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
    messages: convertToModelMessages(messages ?? []),
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

      trace.getActiveSpan()?.end()
    }
  })

  const flushSpans = async () => {
    await langfuseSpanProcessor.forceFlush()
  }

  res.once('finish', flushSpans)
  res.once('close', flushSpans)

  result.pipeDataStreamToResponse(res, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}

export default observe(chatHandler, {
  name: 'chat-message',
  endOnExit: false
})
