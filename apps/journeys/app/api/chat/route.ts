import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { UIMessage, convertToModelMessages, streamText } from 'ai'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const apologist = createOpenAICompatible({
    name: 'apologist',
    apiKey: process.env.APOLOGIST_API_KEY,
    baseURL: `${process.env.APOLOGIST_API_URL}`
  })

  const result = streamText({
    model: apologist('openai/gpt/4o'),
    messages: convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
