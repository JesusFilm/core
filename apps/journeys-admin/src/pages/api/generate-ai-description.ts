import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export default async function handler(req: NextRequest): Promise<Response> {
  const { journey } = await req.json()

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    prompt: `
      As a skilled content creator, please generate a compelling and SEO-friendly description for the following journey.
      The description should be in Markdown format and highlight the key features and benefits of the journey.
      This description will be used for internal AI notes, so please keep it concise and to the point.

      Journey:
      ${JSON.stringify(journey, null, 2)}
    `
  })

  const stream = new ReadableStream({
    async start(controller) {
      for await (const delta of result.textStream) {
        controller.enqueue(delta)
      }
      controller.close()
    }
  })

  return new Response(stream)
}
