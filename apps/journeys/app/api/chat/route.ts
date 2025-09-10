import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { UIMessage, convertToModelMessages, streamText } from 'ai'

import { getPrompt } from '../../../src/lib/ai/langfuse/promptHelper'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: `${process.env.APOLOGIST_API_URL}`
  })

  const systemPrompt = await getPrompt('Chat-Prompt')

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: convertToModelMessages(messages),
    system: systemPrompt
  })

  return result.toUIMessageStreamResponse()
}
