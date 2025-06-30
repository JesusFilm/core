import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { jwtDecode } from 'jwt-decode'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import {
  langfuse,
  langfuseEnvironment,
  langfuseExporter
} from '../../../../src/libs/ai/langfuse/server'

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

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json()
  const schema = z.object({
    journey: z.object({}).passthrough()
  })
  const { journey } = schema.parse(body)

  const token = req.headers.get('Authorization')

  if (token == null)
    return Response.json({ error: 'Missing token' }, { status: 400 })
  const decoded = z
    .object({
      user_id: z.string(),
      auth_time: z.number()
    })
    .parse(jwtDecode(token.split(' ')[1]))

  const prompt = await langfuse.getPrompt(
    'ai-journey-context-prompt',
    undefined,
    {
      label: langfuseEnvironment,
      cacheTtlSeconds: process.env.VERCEL_ENV === 'preview' ? 0 : 60
    }
  )

  const langfuseTraceId = uuidv4()

  const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: prompt.compile({
      journey: JSON.stringify(journey, null, 2)
    }),
    experimental_telemetry: {
      isEnabled: true,
      metadata: {
        langfuseTraceId,
        langfusePrompt: prompt.toJSON(),
        userId: decoded.user_id,
        sessionId: `${decoded.user_id}-${decoded.auth_time}`
      }
    }
  })

  await langfuseExporter.forceFlush()

  return Response.json(
    { text },
    {
      status: 200,
      headers: {
        'x-trace-id': langfuseTraceId
      }
    }
  )
}
