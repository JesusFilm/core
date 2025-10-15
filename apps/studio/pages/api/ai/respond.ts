import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import type {
  ResponseInput,
  ResponseInputMessageContentList
} from 'openai/resources/responses/responses'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type ChatContentItem =
  | string
  | {
      type: string
      [key: string]: any
    }

type ChatMessage = {
  role: 'user' | 'assistant' | 'system' | 'developer'
  content: string | ChatContentItem[]
}

const toInputText = (text: unknown) =>
  typeof text === 'string' ? text : JSON.stringify(text)

const toInputImage = (item: Record<string, any>) => {
  const { image_url, detail } = item

  if (typeof image_url === 'string') {
    return {
      type: 'input_image' as const,
      image_url,
      detail: (detail as 'low' | 'high' | 'auto') ?? 'auto'
    }
  }

  if (image_url && typeof image_url === 'object') {
    const url = 'url' in image_url ? image_url.url : undefined
    const derivedDetail =
      (image_url.detail as 'low' | 'high' | 'auto' | undefined) ?? detail ?? 'auto'

    return {
      type: 'input_image' as const,
      image_url: typeof url === 'string' ? url : undefined,
      detail: derivedDetail
    }
  }

  return {
    type: 'input_image' as const,
    image_url: undefined,
    detail: (detail as 'low' | 'high' | 'auto') ?? 'auto'
  }
}

const normalizeContent = (
  content: ChatMessage['content']
): string | ResponseInputMessageContentList => {
  if (!Array.isArray(content)) {
    return toInputText(content)
  }

  return content.map((item) => {
    if (typeof item === 'string') {
      return {
        type: 'input_text' as const,
        text: item
      }
    }

    if (item?.type === 'input_text' || item?.type === 'input_image') {
      return item
    }

    if (item?.type === 'text') {
      return {
        type: 'input_text' as const,
        text: typeof item.text === 'string' ? item.text : JSON.stringify(item.text)
      }
    }

    if (item?.type === 'image_url') {
      return toInputImage(item)
    }

    return {
      type: 'input_text' as const,
      text: JSON.stringify(item)
    }
  })
}

const normalizeMessages = (messages: ChatMessage[]): ResponseInput =>
  messages.map((message) => {
    const normalizedContent = normalizeContent(message.content)

    if (typeof normalizedContent === 'string') {
      return {
        role: message.role,
        content: normalizedContent
      }
    }

    return {
      type: 'message',
      role: message.role,
      content: normalizedContent
    }
  })

const pickOptionalFields = (body: Record<string, any>) => {
  const allowedFields = [
    'audio',
    'input',
    'instructions',
    'metadata',
    'modalities',
    'output_format',
    'parallel_tool_calls',
    'presence_penalty',
    'reasoning',
    'response_format',
    'store',
    'temperature',
    'tool_config',
    'tools',
    'frequency_penalty',
    'top_k',
    'top_p',
    'user'
  ] as const

  return allowedFields.reduce<Record<string, any>>((accumulator, field) => {
    if (body[field] !== undefined) {
      accumulator[field] = body[field]
    }
    return accumulator
  }, {})
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' })
    return
  }

  try {
    const { model = 'gpt-4o', messages, max_tokens, max_output_tokens } = req.body ?? {}

    const payload: Record<string, any> = pickOptionalFields(req.body ?? {})

    if (Array.isArray(messages)) {
      payload.input = normalizeMessages(messages as ChatMessage[])
    } else if (payload.input === undefined) {
      if (typeof req.body?.input === 'string' && req.body.input.trim() !== '') {
        payload.input = req.body.input
      } else {
        res.status(400).json({ error: 'Request body must include messages or input.' })
        return
      }
    }

    const normalizedInput = payload.input
    if (Array.isArray(normalizedInput)) {
      if (normalizedInput.length === 0) {
        res.status(400).json({ error: 'Provided input is empty.' })
        return
      }
    } else if (typeof normalizedInput === 'string') {
      if (normalizedInput.trim().length === 0) {
        res.status(400).json({ error: 'Provided input is empty.' })
        return
      }
    } else {
      res.status(400).json({ error: 'Provided input format is not supported.' })
      return
    }

    payload.model = model

    if (typeof max_output_tokens === 'number') {
      payload.max_output_tokens = max_output_tokens
    } else if (typeof max_tokens === 'number') {
      payload.max_output_tokens = max_tokens
    }

    const response = await client.responses.create(payload)

    res.status(200).json(response)
  } catch (error: unknown) {
    console.error('OpenAI proxy error:', error)

    if (error && typeof error === 'object' && 'status' in error) {
      const status = typeof (error as { status?: number }).status === 'number'
        ? (error as { status: number }).status
        : 500

      res.status(status).json({
        error: 'OpenAI request failed',
        details: (error as any).message ?? 'Unknown error'
      })
      return
    }

    res.status(500).json({
      error: 'Unexpected error while contacting OpenAI.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
