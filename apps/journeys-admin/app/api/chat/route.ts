import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

// Allow streaming responses up to 30 seconds

import { tools } from '../../../src/libs/ai/tools'
import { createApolloClient } from '../../../src/libs/apolloClient'

export const maxDuration = 30

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const token = req.headers.get('Authorization')

    if (token == null)
      return Response.json({ error: 'Missing token' }, { status: 400 })

    const client = createApolloClient(token.split(' ')[1])

    const result = streamText({
      model: google('gemini-2.0-flash-lite'),
      messages,
      tools: tools(client)
    })
    return result.toDataStreamResponse()
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
