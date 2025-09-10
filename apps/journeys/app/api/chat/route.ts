import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { UIMessage, convertToModelMessages, streamText } from 'ai'

import {
  langfuseClient,
  langfuseEnvironment
} from '../../../src/lib/ai/langfuse/server'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: `${process.env.APOLOGIST_API_URL}`
  })

  const systemPrompt = await langfuseClient.prompt.get('Chat-Prompt', {
    label: langfuseEnvironment
  })

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: convertToModelMessages(messages),
    system: systemPrompt.compile()
  })

  return result.toUIMessageStreamResponse()
}
