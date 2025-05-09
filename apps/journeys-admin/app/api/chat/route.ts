import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

// Allow streaming responses up to 30 seconds

import { tools } from '../../../src/libs/ai/tools'
import { createApolloClient } from '../../../src/libs/apolloClient'

export const maxDuration = 30

export const runtime = 'edge'

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return JSON.stringify(error)
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const token = req.headers.get('Authorization')

  if (token == null)
    return Response.json({ error: 'Missing token' }, { status: 400 })

  const client = createApolloClient(token.split(' ')[1])

  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages,
    tools: tools(client)
  })

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler
  })
}
